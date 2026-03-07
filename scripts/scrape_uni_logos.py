#!/usr/bin/env python3
"""
scrape_uni_logos.py  (v3)
------------------------
Strategy: fetch the Spanish Wikipedia article HTML for each university,
parse the infobox <td class="imagen"> and grab the FIRST <img> src inside it.
That img is always the escudo/logo rendered as a Wikimedia PNG thumbnail.
Use the highest-res srcset URL available (2x).

Output:
  - frontend/static/logos/<slug>.png   (256×256 white-bg PNG, no upscale)
  - frontend/static/logos/manifest.json
"""

import csv
import json
import re
import time
import unicodedata
from html.parser import HTMLParser
from io import BytesIO
from pathlib import Path
from urllib.parse import urljoin, unquote

import requests
from PIL import Image

# ── Config ────────────────────────────────────────────────────────────────────
CSV_PATH      = Path("backend/src/db/data/notas_corte.csv")
OUTPUT_DIR    = Path("frontend/static/logos")
MANIFEST_PATH = OUTPUT_DIR / "manifest.json"
LOGO_SIZE     = (256, 256)
DELAY_S       = 0.8

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; AsroPAU/1.0; +https://github.com/AsroLabs/AsroPAU)",
    "Accept-Language": "es",
}

# CSV university name → Spanish Wikipedia article slug (URL path segment)
WIKI_SLUGS: dict[str, str] = {
    "Universidad Autónoma de Madrid":              "Universidad_Autónoma_de_Madrid",
    "Universidad Carlos III de Madrid":            "Universidad_Carlos_III_de_Madrid",
    "Universidad Complutense de Madrid":           "Universidad_Complutense_de_Madrid",
    "Universidad Miguel Hernández de Elche":       "Universidad_Miguel_Hernández_de_Elche",
    "Universidad Nacional de Educación a Distancia": "Universidad_Nacional_de_Educación_a_Distancia",
    "Universidad Pablo de Olavide":                "Universidad_Pablo_de_Olavide",
    "Universidad Politécnica de Cartagena":        "Universidad_Politécnica_de_Cartagena",
    "Universidad Politécnica de Madrid":           "Universidad_Politécnica_de_Madrid",
    "Universidad Pública de Navarra":              "Universidad_Pública_de_Navarra",
    "Universidad Rey Juan Carlos":                 "Universidad_Rey_Juan_Carlos",
    "Universidad de Alcalá":                       "Universidad_de_Alcalá",
    "Universidad de Alicante":                     "Universidad_de_Alicante",
    "Universidad de Almería":                      "Universidad_de_Almería",
    "Universidad de Burgos":                       "Universidad_de_Burgos",
    "Universidad de Cantabria":                    "Universidad_de_Cantabria",
    "Universidad de Castilla - La Mancha":         "Universidad_de_Castilla-La_Mancha",
    "Universidad de Cádiz":                        "Universidad_de_Cádiz",
    "Universidad de Córdoba":                      "Universidad_de_Córdoba_(España)",
    "Universidad de Extremadura":                  "Universidad_de_Extremadura",
    "Universidad de Granada":                      "Universidad_de_Granada",
    "Universidad de Huelva":                       "Universidad_de_Huelva",
    "Universidad de Jaén":                         "Universidad_de_Jaén",
    "Universidad de La Laguna":                    "Universidad_de_La_Laguna",
    "Universidad de La Rioja":                     "Universidad_de_La_Rioja",
    "Universidad de Las Palmas de Gran Canaria":   "Universidad_de_Las_Palmas_de_Gran_Canaria",
    "Universidad de León":                         "Universidad_de_León",
    "Universidad de Murcia":                       "Universidad_de_Murcia",
    "Universidad de Málaga":                       "Universidad_de_Málaga",
    "Universidad de Oviedo":                       "Universidad_de_Oviedo",
    "Universidad de Salamanca":                    "Universidad_de_Salamanca",
    "Universidad de Sevilla":                      "Universidad_de_Sevilla",
    "Universidad de Valladolid":                   "Universidad_de_Valladolid",
    "Universidad de Zaragoza":                     "Universidad_de_Zaragoza",
    "Universidad del País Vasco":                  "Universidad_del_País_Vasco",
    "Universidade da Coruña":                      "Universidad_de_La_Coruña",
    "Universidade de Santiago de Compostela":      "Universidad_de_Santiago_de_Compostela",
    "Universidade de Vigo":                        "Universidad_de_Vigo",
    "Universitat Autònoma de Barcelona":           "Universidad_Autónoma_de_Barcelona",
    "Universitat Jaume I":                         "Universidad_Jaume_I",
    "Universitat Politècnica de Catalunya":        "Universidad_Politécnica_de_Cataluña",
    "Universitat Politècnica de València":         "Universidad_Politécnica_de_Valencia",
    "Universitat Pompeu Fabra":                    "Universidad_Pompeu_Fabra",
    "Universitat Rovira i Virgili":                "Universidad_Rovira_i_Virgili",
    "Universitat de Barcelona":                    "Universidad_de_Barcelona",
    "Universitat de Girona":                       "Universidad_de_Girona",
    "Universitat de Lleida":                       "Universidad_de_Lleida",
    "Universitat de València":                     "Universidad_de_Valencia",
    "Universitat de les Illes Balears":            "Universidad_de_las_Islas_Baleares",
}


def slugify(name: str) -> str:
    nfkd = unicodedata.normalize("NFKD", name)
    ascii_str = nfkd.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^\w\s-]", "", ascii_str).strip().lower()
    return re.sub(r"[\s_]+", "-", slug)


class InfoboxImageParser(HTMLParser):
    """
    Finds the first <img> inside a <td class="imagen"> inside an infobox.
    Returns src and best srcset URL.
    """
    def __init__(self) -> None:
        super().__init__()
        self._in_infobox = False
        self._infobox_depth = 0
        self._in_imagen_td = False
        self._imagen_td_depth = 0
        self._depth = 0
        self.img_src: str | None = None
        self.img_srcset_best: str | None = None

    def handle_starttag(self, tag: str, attrs: list) -> None:
        self._depth += 1
        attr = dict(attrs)

        if tag == "table" and "infobox" in attr.get("class", ""):
            self._in_infobox = True
            self._infobox_depth = self._depth

        if self._in_infobox and tag == "td" and "imagen" in attr.get("class", ""):
            self._in_imagen_td = True
            self._imagen_td_depth = self._depth

        if self._in_imagen_td and tag == "img" and self.img_src is None:
            src = attr.get("src", "")
            # Normalise protocol-relative URLs
            if src.startswith("//"):
                src = "https:" + src
            self.img_src = src

            # Parse srcset to find highest-resolution entry
            srcset = attr.get("srcset", "")
            if srcset:
                best_url = None
                best_mult = 0.0
                for entry in srcset.split(","):
                    entry = entry.strip()
                    parts = entry.split()
                    if len(parts) >= 1:
                        url = parts[0]
                        mult = float(parts[1].rstrip("x")) if len(parts) >= 2 else 1.0
                        if mult > best_mult:
                            best_mult = mult
                            best_url = url
                if best_url:
                    if best_url.startswith("//"):
                        best_url = "https:" + best_url
                    self.img_srcset_best = best_url

    def handle_endtag(self, tag: str) -> None:
        if self._in_imagen_td and self._depth == self._imagen_td_depth:
            self._in_imagen_td = False
        if self._in_infobox and self._depth == self._infobox_depth:
            self._in_infobox = False
        self._depth -= 1

    @property
    def best_url(self) -> str | None:
        return self.img_srcset_best or self.img_src


def get_infobox_logo_url(wiki_slug: str) -> str | None:
    """
    Fetches the Wikipedia article HTML and extracts the infobox logo URL.
    """
    url = f"https://es.wikipedia.org/wiki/{wiki_slug}"
    try:
        r = requests.get(url, headers=HEADERS, timeout=20)
        r.raise_for_status()
    except Exception as e:
        print(f"    [WARN] fetch failed for {url}: {e}")
        return None

    parser = InfoboxImageParser()
    parser.feed(r.text)
    return parser.best_url


def download_and_save(img_url: str, dest: Path) -> bool:
    try:
        resp = requests.get(img_url, headers=HEADERS, timeout=20)
        resp.raise_for_status()

        raw = BytesIO(resp.content)
        img = Image.open(raw).convert("RGBA")

        # White background composite
        bg = Image.new("RGBA", img.size, (255, 255, 255, 255))
        bg.paste(img, mask=img.split()[3])
        img = bg.convert("RGB")

        # Contain within LOGO_SIZE (no upscale beyond original)
        img.thumbnail(LOGO_SIZE, Image.LANCZOS)

        # Pad to exact square with white
        square = Image.new("RGB", LOGO_SIZE, (255, 255, 255))
        offset = ((LOGO_SIZE[0] - img.width) // 2, (LOGO_SIZE[1] - img.height) // 2)
        square.paste(img, offset)
        square.save(dest, "PNG", optimize=True)
        return True

    except Exception as e:
        print(f"    [WARN] download/save failed ({img_url[:70]}): {e}")
        return False


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    manifest: dict[str, str] = {}
    if MANIFEST_PATH.exists():
        with open(MANIFEST_PATH) as f:
            manifest = json.load(f)

    public_unis: set[str] = set()
    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            if "Pública" in row.get("tipo_centro", ""):
                public_unis.add(row["universidad"].strip())

    print(f"Found {len(public_unis)} public universities\n")
    success = skipped = failed = 0

    for uni in sorted(public_unis):
        slug = slugify(uni)
        dest = OUTPUT_DIR / f"{slug}.png"

        wiki_slug = WIKI_SLUGS.get(uni, uni.replace(" ", "_"))
        print(f"  [{uni}]")

        img_url = get_infobox_logo_url(wiki_slug)
        if not img_url:
            print(f"    [FAIL] no infobox logo found")
            failed += 1
            time.sleep(DELAY_S)
            continue

        print(f"    url: {img_url[:90]}")
        ok = download_and_save(img_url, dest)

        if ok:
            manifest[uni] = f"logos/{slug}.png"
            with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
                json.dump(manifest, f, ensure_ascii=False, indent=2, sort_keys=True)
            success += 1
            print(f"    [OK]")
        else:
            failed += 1
            print(f"    [FAIL]")

        time.sleep(DELAY_S)

    print(f"\nDone — success={success}  skipped={skipped}  failed={failed}")
    print(f"Manifest → {MANIFEST_PATH}")


if __name__ == "__main__":
    main()
