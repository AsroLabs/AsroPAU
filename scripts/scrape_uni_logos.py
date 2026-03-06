#!/usr/bin/env python3
"""
scrape_uni_logos.py
-------------------
Fetches university logos via the Wikimedia REST API (no 403 blocking).
Uses the /page/summary endpoint which returns a thumbnail URL, then
upgrades to original resolution via the Action API.

Output:
  - frontend/static/logos/<slug>.png   (128×128 white-bg PNG)
  - frontend/static/logos/manifest.json  { "Universidad de Granada": "logos/universidad-de-granada.png", ... }
"""

import csv
import json
import re
import time
import unicodedata
from io import BytesIO
from pathlib import Path

import requests
from PIL import Image

# ── Config ────────────────────────────────────────────────────────────────────
CSV_PATH      = Path("backend/src/db/data/notas_corte.csv")
OUTPUT_DIR    = Path("frontend/static/logos")
MANIFEST_PATH = OUTPUT_DIR / "manifest.json"
LOGO_SIZE     = (128, 128)
DELAY_S       = 0.6

HEADERS = {
    "User-Agent": "AsroPAU/1.0 (https://github.com/AsroLabs/AsroPAU; educational) python-requests/2",
    "Referer": "https://es.wikipedia.org/",
    "Accept": "image/png,image/jpeg,image/*,*/*",
}

# Wikipedia article title overrides  (CSV name → Spanish Wikipedia title)
WIKI_TITLES: dict[str, str] = {
    "Universidad Autónoma de Madrid":              "Universidad Autónoma de Madrid",
    "Universidad Carlos III de Madrid":            "Universidad Carlos III de Madrid",
    "Universidad Complutense de Madrid":           "Universidad Complutense de Madrid",
    "Universidad Miguel Hernández de Elche":       "Universidad Miguel Hernández de Elche",
    "Universidad Nacional de Educación a Distancia": "Universidad Nacional de Educación a Distancia",
    "Universidad Pablo de Olavide":                "Universidad Pablo de Olavide",
    "Universidad Politécnica de Cartagena":        "Universidad Politécnica de Cartagena",
    "Universidad Politécnica de Madrid":           "Universidad Politécnica de Madrid",
    "Universidad Pública de Navarra":              "Universidad Pública de Navarra",
    "Universidad Rey Juan Carlos":                 "Universidad Rey Juan Carlos",
    "Universidad de Alcalá":                       "Universidad de Alcalá",
    "Universidad de Alicante":                     "Universidad de Alicante",
    "Universidad de Almería":                      "Universidad de Almería",
    "Universidad de Burgos":                       "Universidad de Burgos",
    "Universidad de Cantabria":                    "Universidad de Cantabria",
    "Universidad de Castilla - La Mancha":         "Universidad de Castilla-La Mancha",
    "Universidad de Cádiz":                        "Universidad de Cádiz",
    "Universidad de Córdoba":                      "Universidad de Córdoba (España)",
    "Universidad de Extremadura":                  "Universidad de Extremadura",
    "Universidad de Granada":                      "Universidad de Granada",
    "Universidad de Huelva":                       "Universidad de Huelva",
    "Universidad de Jaén":                         "Universidad de Jaén",
    "Universidad de La Laguna":                    "Universidad de La Laguna",
    "Universidad de La Rioja":                     "Universidad de La Rioja",
    "Universidad de Las Palmas de Gran Canaria":   "Universidad de Las Palmas de Gran Canaria",
    "Universidad de León":                         "Universidad de León",
    "Universidad de Murcia":                       "Universidad de Murcia",
    "Universidad de Málaga":                       "Universidad de Málaga",
    "Universidad de Oviedo":                       "Universidad de Oviedo",
    "Universidad de Salamanca":                    "Universidad de Salamanca",
    "Universidad de Sevilla":                      "Universidad de Sevilla",
    "Universidad de Valladolid":                   "Universidad de Valladolid",
    "Universidad de Zaragoza":                     "Universidad de Zaragoza",
    "Universidad del País Vasco":                  "Universidad del País Vasco",
    "Universidade da Coruña":                      "Universidad de La Coruña",
    "Universidade de Santiago de Compostela":      "Universidad de Santiago de Compostela",
    "Universidade de Vigo":                        "Universidad de Vigo",
    "Universitat Autònoma de Barcelona":           "Universidad Autónoma de Barcelona",
    "Universitat Jaume I":                         "Universidad Jaume I",
    "Universitat Politècnica de Catalunya":        "Universidad Politécnica de Cataluña",
    "Universitat Politècnica de València":         "Universidad Politécnica de Valencia",
    "Universitat Pompeu Fabra":                    "Universidad Pompeu Fabra",
    "Universitat Rovira i Virgili":                "Universidad Rovira i Virgili",
    "Universitat de Barcelona":                    "Universidad de Barcelona",
    "Universitat de Girona":                       "Universidad de Girona",
    "Universitat de Lleida":                       "Universidad de Lleida",
    "Universitat de València":                     "Universidad de Valencia",
    "Universitat de les Illes Balears":            "Universidad de las Islas Baleares",
}


def slugify(name: str) -> str:
    nfkd = unicodedata.normalize("NFKD", name)
    ascii_str = nfkd.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^\w\s-]", "", ascii_str).strip().lower()
    return re.sub(r"[\s_]+", "-", slug)


def get_logo_url_via_action_api(wiki_title: str) -> str | None:
    """
    Uses the Wikipedia Action API to get all images in the article,
    then picks the best one (escudo/logo/seal keywords first).
    Then gets the actual file URL via imageinfo.
    """
    session = requests.Session()
    session.headers.update(HEADERS)

    # Step 1: get list of images used in the article
    params = {
        "action": "query",
        "titles": wiki_title,
        "prop": "images",
        "imlimit": "30",
        "format": "json",
        "redirects": "1",
    }
    try:
        r = session.get("https://es.wikipedia.org/w/api.php", params=params, timeout=15)
        r.raise_for_status()
        data = r.json()
    except Exception as e:
        print(f"    [WARN] Action API images query failed: {e}")
        return None

    pages = data.get("query", {}).get("pages", {})
    images: list[str] = []
    for page in pages.values():
        for img in page.get("images", []):
            title = img.get("title", "")
            if title:
                images.append(title)

    if not images:
        return None

    # Step 2: rank images — prefer logo/escudo/seal keywords
    priority_kw = ["escudo", "logo", "logotipo", "seal", "emblema", "crest", "marca",
                   "insignia", "blazon", "shield", "arms"]
    skip_kw     = ["flag", "bandera", "campus", "edificio", "fachada", "archivo", "map",
                   "mapa", "spain", "espana", "icono", "commons-logo", "ambox", "question",
                   "emblem-question", "pallium", "bus", "aula", "biblio", "foto",
                   "archivo", ".jpg", ".jpeg"]  # skip photos — prefer SVG/PNG logos

    # Separate logo candidates from generic images
    logo_candidates = [img for img in images if any(kw in img.lower() for kw in priority_kw)]
    non_photo_candidates = [img for img in images
                            if not any(kw in img.lower() for kw in ["flag", "bandera", "campus",
                               "edificio", "fachada", "ambox", "commons-logo", "question",
                               "pallium", "bus"])
                            and (img.lower().endswith(".svg") or img.lower().endswith(".png"))]

    def score(title: str) -> int:
        t = title.lower()
        if any(kw in t for kw in ["commons-logo", "ambox", "question", "pallium",
                                   "bus-", "flag", "bandera"]):
            return -100
        s = 0
        for i, kw in enumerate(priority_kw):
            if kw in t:
                s += len(priority_kw) - i + 10
        # Prefer SVG/PNG over JPEG photos
        if t.endswith(".svg") or t.endswith(".png"):
            s += 5
        if t.endswith(".jpg") or t.endswith(".jpeg"):
            s -= 3
        return s

    ranked = sorted(images, key=score, reverse=True)
    # Prioritize real logo candidates; fall back to non-photo SVG/PNG; last resort: all
    if logo_candidates:
        ranked = sorted(logo_candidates, key=score, reverse=True) + \
                 [x for x in ranked if x not in logo_candidates]
    elif non_photo_candidates:
        ranked = sorted(non_photo_candidates, key=score, reverse=True) + \
                 [x for x in ranked if x not in non_photo_candidates]
    ranked = [img for img in ranked if score(img) > -100]
    if not ranked:
        ranked = images  # absolute fallback

    # Step 3: get imageinfo URL for top candidate
    for candidate in ranked[:5]:
        params2 = {
            "action": "query",
            "titles": candidate,
            "prop": "imageinfo",
            "iiprop": "url|mime",
            "format": "json",
        }
        try:
            r2 = session.get("https://es.wikipedia.org/w/api.php", params=params2, timeout=15)
            r2.raise_for_status()
            data2 = r2.json()
        except Exception as e:
            print(f"    [WARN] imageinfo failed for {candidate}: {e}")
            continue

        for p in data2.get("query", {}).get("pages", {}).values():
            ii = p.get("imageinfo", [])
            if ii:
                url  = ii[0].get("url", "")
                mime = ii[0].get("mime", "")
                if url:
                    return url

    return None


def download_and_save(img_url: str, dest: Path) -> bool:
    try:
        session = requests.Session()
        session.headers.update(HEADERS)
        resp = session.get(img_url, timeout=20)
        resp.raise_for_status()

        content_type = resp.headers.get("Content-Type", "")
        raw = BytesIO(resp.content)

        # SVG → try cairosvg, else skip
        if "svg" in content_type or img_url.lower().endswith(".svg"):
            try:
                import cairosvg  # type: ignore
                png_data = cairosvg.svg2png(bytestring=resp.content, output_width=256, output_height=256)
                raw = BytesIO(png_data)
            except ImportError:
                # No cairosvg: try to open as-is (will likely fail for SVG)
                pass
            except Exception as e:
                print(f"    [WARN] cairosvg conversion failed: {e}")
                return False

        img = Image.open(raw).convert("RGBA")

        # White background
        bg = Image.new("RGBA", img.size, (255, 255, 255, 255))
        bg.paste(img, mask=img.split()[3])
        img = bg.convert("RGB")

        # Contain within 128×128 (no upscale)
        img.thumbnail(LOGO_SIZE, Image.LANCZOS)

        # Pad to exact square
        square = Image.new("RGB", LOGO_SIZE, (255, 255, 255))
        offset = ((LOGO_SIZE[0] - img.width) // 2, (LOGO_SIZE[1] - img.height) // 2)
        square.paste(img, offset)
        square.save(dest, "PNG", optimize=True)
        return True

    except Exception as e:
        print(f"    [WARN] download/convert failed ({img_url[:60]}): {e}")
        return False


def get_logo_url_via_rest_summary(wiki_title: str) -> str | None:
    """Fallback: Wikimedia REST summary API returns a page thumbnail."""
    session = requests.Session()
    session.headers.update(HEADERS)
    encoded = requests.utils.quote(wiki_title.replace(" ", "_"))
    url = f"https://es.wikipedia.org/api/rest_v1/page/summary/{encoded}"
    try:
        r = session.get(url, timeout=15)
        if r.status_code != 200:
            return None
        data = r.json()
        orig = data.get("originalimage", {}).get("source")
        thumb = data.get("thumbnail", {}).get("source")
        return orig or thumb
    except Exception as e:
        print(f"    [WARN] REST summary fallback failed: {e}")
        return None


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

        if dest.exists() and uni in manifest:
            print(f"  [SKIP] {uni}")
            skipped += 1
            continue

        wiki_title = WIKI_TITLES.get(uni, uni)
        print(f"  [{uni}]  wp:{wiki_title}")

        img_url = get_logo_url_via_action_api(wiki_title)

        ok = False
        if img_url:
            print(f"    url: {img_url[:80]}")
            ok = download_and_save(img_url, dest)

        # Fallback: REST summary thumbnail
        if not ok:
            print(f"    [FALLBACK] trying REST summary thumbnail...")
            img_url2 = get_logo_url_via_rest_summary(wiki_title)
            if img_url2 and img_url2 != img_url:
                print(f"    url2: {img_url2[:80]}")
                ok = download_and_save(img_url2, dest)

        if ok:
            manifest[uni] = f"logos/{slug}.png"
            with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
                json.dump(manifest, f, ensure_ascii=False, indent=2, sort_keys=True)
            success += 1
            print(f"    [OK]")
        else:
            print(f"    [FAIL] all strategies exhausted")
            failed += 1

        time.sleep(DELAY_S)

    print(f"\nDone — success={success}  skipped={skipped}  failed={failed}")
    print(f"Manifest → {MANIFEST_PATH}")


if __name__ == "__main__":
    main()
