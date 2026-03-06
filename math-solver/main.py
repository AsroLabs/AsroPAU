from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Tuple
import sympy
from sympy import (
    symbols, Eq, solve, factor, expand, simplify, diff, integrate, limit,
    Symbol, degree, Poly, sqrt, Rational, latex as sym_latex, oo,
    sin, cos, tan, log, exp, pi, E, Number, count_ops, apart, ln
)
from sympy.core.function import AppliedUndef
import time
import re

app = FastAPI(title="Math Equation Solver API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Models ───────────────────────────────────────────────────────────────────

class SolveRequest(BaseModel):
    input: str
    mode: str = "text"
    equation_type: str = "auto"


class Step(BaseModel):
    step_number:       int
    description:       str
    expr_latex:        str                      # plain LaTeX — no \textcolor, always shown
    highlighted_latex: Optional[str] = ""      # LaTeX with \textcolor on the active part — shown while animating
    explanation:       Optional[str] = ""
    rule_name:         Optional[str] = ""       # short rule name shown as pill in UI
    highlight_color:   Optional[str] = ""       # hex color for the step's accent


class SolveResponse(BaseModel):
    steps: List[Step]
    result: dict
    metadata: dict


# ─── Semantic color palette ───────────────────────────────────────────────────

C_ACTIVE = "#EA580C"   # orange  — term being operated / active rule
C_CONST  = "#2563EB"   # blue    — constants / coefficients
C_RESULT = "#16A34A"   # green   — result / simplified form
C_REMOVE = "#DC2626"   # red     — term that disappears / moves sides
C_CTX    = "#6B7280"   # gray    — context that doesn't change


def tc(color: str, s: str) -> str:
    r"""Wrap a LaTeX string in \textcolor{color}{s}."""
    return f"\\textcolor{{{color}}}{{{s}}}"


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _s(n: int, desc: str, latex_plain: str,
       expl: str = "", rule: str = "", color: str = "",
       highlighted: str = "") -> Step:
    """Build a Step.

    latex_plain   — clean LaTeX shown when idle/complete (no \\textcolor)
    highlighted   — LaTeX with \\textcolor on the active part, shown while
                    the step is in the spotlight; defaults to latex_plain
    """
    return Step(
        step_number=n,
        description=desc,
        expr_latex=latex_plain,
        highlighted_latex=highlighted or latex_plain,
        explanation=expl,
        rule_name=rule,
        highlight_color=color,
    )


def _safe_parse(expr_str: str):
    """Parse with transformations; normalise ln(→log( for SymPy."""
    normalised = re.sub(r'\bln\s*\(', 'log(', expr_str)
    return sympy.parse_expr(normalised, transformations='all')


def detect_equation_type(expr_str: str) -> str:
    s = expr_str.lower().strip()
    if re.search(r'\bdiff\b', s) or 'd/dx' in s:
        return "derivative"
    if 'integrate(' in s or '∫' in expr_str or re.match(r'^int\b', s):
        return "integral"
    if re.match(r'^lim\b', s):
        return "limit"
    if "=" in expr_str:
        return "algebra"
    return "expression"


# ─── Algebra ──────────────────────────────────────────────────────────────────

def solve_algebraic_equation(expr_str: str) -> SolveResponse:
    x = symbols('x')
    steps: List[Step] = []

    try:
        if "=" in expr_str:
            left_str, right_str = expr_str.split("=", 1)
            lhs = _safe_parse(left_str.strip())
            rhs = _safe_parse(right_str.strip())
            eq = Eq(lhs, rhs)

            steps.append(_s(1,
                "Ecuación original",
                f"{sym_latex(lhs)} = {sym_latex(rhs)}",
                "Identificamos la ecuación a resolver para x.",
                color=C_ACTIVE,
                highlighted=f"{tc(C_ACTIVE, sym_latex(lhs))} = {tc(C_ACTIVE, sym_latex(rhs))}",
            ))

            combined = sympy.expand(lhs - rhs)
            steps.append(_s(2,
                "Pasar todo al lado izquierdo",
                f"{sym_latex(combined)} = 0",
                "Restamos el lado derecho en ambos miembros para igualar a cero.",
                rule="Reorganizar",
                color=C_ACTIVE,
                highlighted=f"{tc(C_ACTIVE, sym_latex(combined))} = 0",
            ))

            factored = factor(combined)
            if factored != combined and factored.is_Mul:
                steps.append(_s(3,
                    "Factorizar",
                    f"{sym_latex(factored)} = 0",
                    "Factorizamos para identificar las raíces más fácilmente.",
                    rule="Factorización",
                    color=C_CONST,
                    highlighted=f"{tc(C_CONST, sym_latex(factored))} = 0",
                ))

            deg = None
            try:
                p = Poly(combined, x)
                deg = p.degree()
                if deg == 2:
                    a_coef = p.nth(2)
                    b_coef = p.nth(1)
                    c_coef = p.nth(0)
                    discriminant = b_coef**2 - 4*a_coef*c_coef

                    steps.append(_s(len(steps)+1,
                        "Identificar coeficientes (ax² + bx + c = 0)",
                        (f"a = {sym_latex(a_coef)},\\quad "
                         f"b = {sym_latex(b_coef)},\\quad "
                         f"c = {sym_latex(c_coef)}"),
                        "Reconocemos la forma estándar de la ecuación de segundo grado.",
                        rule="Cuadrática",
                        color=C_CONST,
                        highlighted=(
                            f"{tc(C_CONST,'a')} = {tc(C_CONST, sym_latex(a_coef))},\\quad "
                            f"{tc(C_CONST,'b')} = {tc(C_CONST, sym_latex(b_coef))},\\quad "
                            f"{tc(C_CONST,'c')} = {tc(C_CONST, sym_latex(c_coef))}"
                        ),
                    ))

                    disc_plain = (
                        f"\\Delta = b^2 - 4ac"
                        f" = ({sym_latex(b_coef)})^2"
                        f" - 4 \\cdot ({sym_latex(a_coef)})"
                        f" \\cdot ({sym_latex(c_coef)})"
                        f" = {sym_latex(discriminant)}"
                    )
                    disc_highlighted = (
                        f"\\Delta = {tc(C_CONST,'b')}^2 - 4{tc(C_CONST,'a')}{tc(C_CONST,'c')}"
                        f" = ({tc(C_CONST, sym_latex(b_coef))})^2"
                        f" - 4 \\cdot ({tc(C_CONST, sym_latex(a_coef))})"
                        f" \\cdot ({tc(C_CONST, sym_latex(c_coef))})"
                        f" = {tc(C_ACTIVE, sym_latex(discriminant))}"
                    )
                    steps.append(_s(len(steps)+1,
                        "Calcular el discriminante",
                        disc_plain,
                        "El discriminante determina cuántas soluciones reales tiene la ecuación.",
                        rule="Discriminante",
                        color=C_ACTIVE,
                        highlighted=disc_highlighted,
                    ))

                    # BUG-037 fix: discriminant comparison raises TypeError for symbolic coefficients
                    try:
                        disc_positive = bool(discriminant > 0)
                        disc_zero     = bool(discriminant == 0)
                    except TypeError:
                        disc_positive = False
                        disc_zero     = False

                    if disc_positive:
                        steps.append(_s(len(steps)+1,
                            "Aplicar la fórmula cuadrática",
                            r"x = \frac{-b \pm \sqrt{\Delta}}{2a}",
                            "Δ > 0 → dos soluciones reales distintas.",
                            rule="Fórmula",
                            color=C_ACTIVE,
                            highlighted=(
                                r"x = \frac{"
                                + tc(C_REMOVE, "-b")
                                + r" \pm \sqrt{"
                                + tc(C_ACTIVE, r"\Delta")
                                + r"}}{"
                                + tc(C_CONST, "2a")
                                + r"}"
                            ),
                        ))
                    elif disc_zero:
                        steps.append(_s(len(steps)+1,
                            "Aplicar la fórmula cuadrática",
                            r"x = \frac{-b}{2a}",
                            "Δ = 0 → una única solución real (raíz doble).",
                            rule="Fórmula",
                            color=C_CONST,
                            highlighted=(
                                r"x = \frac{"
                                + tc(C_REMOVE, "-b")
                                + r"}{"
                                + tc(C_CONST, "2a")
                                + r"}"
                            ),
                        ))
                    else:
                        steps.append(_s(len(steps)+1,
                            "Discriminante negativo",
                            f"\\Delta = {sym_latex(discriminant)} < 0",
                            "Δ < 0 → no existen soluciones reales.",
                            rule="Sin solución",
                            color=C_REMOVE,
                            highlighted=f"\\Delta = {tc(C_REMOVE, sym_latex(discriminant))} < 0",
                        ))

                elif deg == 1:
                    steps.append(_s(len(steps)+1,
                        "Ecuación lineal — despejar x",
                        f"{sym_latex(combined)} = 0",
                        "Sumamos/restamos y dividimos para despejar x directamente.",
                        rule="Lineal",
                        color=C_ACTIVE,
                        highlighted=tc(C_ACTIVE, sym_latex(combined)) + " = 0",
                    ))
                elif deg == 3:
                    steps.append(_s(len(steps)+1,
                        "Ecuación cúbica (grado 3)",
                        f"{sym_latex(combined)} = 0",
                        "Buscamos raíces racionales y factorizamos.",
                        rule="Cúbica",
                        color=C_ACTIVE,
                        highlighted=tc(C_ACTIVE, sym_latex(combined)) + " = 0",
                    ))
            except Exception:
                pass

            solutions = solve(eq, x)

            if not solutions:
                return SolveResponse(
                    steps=steps,
                    result={"type": "no_solution", "message": "No hay solución real",
                            "latex": "\\text{Sin solución real}"},
                    metadata={"equation_type": "algebra", "processing_time_ms": 0}
                )

            for i, sol in enumerate(solutions):
                steps.append(_s(len(steps)+1,
                    f"Solución {i+1}",
                    f"x = {sym_latex(sol)}",
                    f"Verificación: sustituir x = {sym_latex(sol)} en la ecuación original.",
                    rule="Solución",
                    color=C_RESULT,
                    highlighted=f"x = {tc(C_RESULT, sym_latex(sol))}",
                ))

            result_latex = " \\quad\\text{o}\\quad ".join(
                [f"x = {tc(C_RESULT, sym_latex(s))}" for s in solutions]
            )
            deg_str = str(deg) if deg is not None else "?"
            return SolveResponse(
                steps=steps,
                result={
                    "type": "equation",
                    "solutions": [str(s) for s in solutions],
                    "latex": result_latex,
                },
                metadata={"equation_type": "algebra", "degree": deg_str, "processing_time_ms": 0}
            )

        else:
            # Expression simplification
            expr = _safe_parse(expr_str)
            steps.append(_s(1,
                "Expresión original",
                sym_latex(expr),
                "Partimos de la expresión tal como se introdujo.",
                color=C_ACTIVE,
            ))

            expanded_expr = expand(expr)
            if expanded_expr != expr:
                steps.append(_s(2,
                    "Expandir",
                    sym_latex(expanded_expr),
                    "Aplicamos la propiedad distributiva para eliminar paréntesis.",
                    rule="Distributiva",
                    color=C_ACTIVE,
                    highlighted=tc(C_ACTIVE, sym_latex(expanded_expr)),
                ))

            factored_expr = factor(expr)
            if factored_expr != expr and factored_expr != expanded_expr:
                steps.append(_s(len(steps)+1,
                    "Forma factorizada",
                    sym_latex(factored_expr),
                    "Expresamos como producto de factores irreducibles.",
                    rule="Factorización",
                    color=C_CONST,
                    highlighted=tc(C_CONST, sym_latex(factored_expr)),
                ))

            simplified = simplify(expr)
            steps.append(_s(len(steps)+1,
                "Forma simplificada",
                sym_latex(simplified),
                "Reducimos la expresión a su forma más simple.",
                rule="Simplificar",
                color=C_RESULT,
                highlighted=tc(C_RESULT, sym_latex(simplified)),
            ))

            return SolveResponse(
                steps=steps,
                result={"type": "expression", "result": str(simplified),
                        "latex": sym_latex(simplified)},
                metadata={"equation_type": "expression", "processing_time_ms": 0}
            )

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al resolver: {str(e)}")


# ─── Derivatives ──────────────────────────────────────────────────────────────

def _classify_diff_rule(expr, x) -> Tuple[str, str]:
    """Return (rule_label, rule_name_pill)."""
    if expr.is_Add:
        return "Regla de la suma/diferencia", "Suma"
    if expr.is_Mul and len(expr.args) >= 2:
        # Check if one factor is a constant (scalar multiple rule)
        x_factors = [a for a in expr.args if a.has(x)]
        const_factors = [a for a in expr.args if not a.has(x)]
        if const_factors and len(x_factors) == 1:
            return "Regla del múltiplo constante", "Constante"
        return "Regla del producto: (uv)' = u'v + uv'", "Producto"
    if expr.is_Pow:
        base, exp_val = expr.args
        if not exp_val.has(x):
            if base == x:
                return f"Regla de la potencia: d/dx(xⁿ) = n·xⁿ⁻¹", "Potencia"
            return "Regla de la cadena + potencia", "Cadena"
        return "Regla de la cadena", "Cadena"
    if expr.has(sin) or expr.has(cos) or expr.has(tan):
        return "Derivada de función trigonométrica", "Trig"
    if expr.has(log):
        return "Derivada de logaritmo: d/dx(ln u) = u'/u", "Logaritmo"
    if expr.has(exp):
        return "Derivada de exponencial: d/dx(eˣ) = eˣ", "Exponencial"
    return "Regla de derivación", "Derivada"


def solve_derivative(expr_str: str) -> SolveResponse:
    x = symbols('x')
    steps: List[Step] = []

    try:
        raw = expr_str.strip()
        if raw.lower().startswith('d/dx(') and raw.endswith(')'):
            inner = raw[5:-1]
        elif raw.lower().startswith('diff('):
            inner = re.sub(r'^diff\s*\(', '', raw, flags=re.I)
            inner = re.sub(r',\s*x\s*\)$', '', inner)
        else:
            inner = raw

        expr = _safe_parse(inner)

        steps.append(_s(1,
            "Función original",
            f"f(x) = {sym_latex(expr)}",
            "Identificamos la función a derivar respecto a x.",
            color=C_ACTIVE,
            highlighted=f"f(x) = {tc(C_ACTIVE, sym_latex(expr))}",
        ))

        rule_desc, rule_pill = _classify_diff_rule(expr, x)
        steps.append(_s(2,
            f"Regla aplicable: {rule_pill}",
            f"\\frac{{d}}{{dx}}\\left[{sym_latex(expr)}\\right]",
            rule_desc,
            rule=rule_pill,
            color=C_ACTIVE,
            highlighted=f"\\frac{{d}}{{dx}}\\left[{tc(C_ACTIVE, sym_latex(expr))}\\right]",
        ))

        # Product rule breakdown — works for 2+ x-containing factors
        if expr.is_Mul and len(expr.args) >= 2:
            x_factors = [a for a in expr.args if a.has(x)]
            if len(x_factors) >= 2:
                u, v = x_factors[0], x_factors[1]
                du = diff(u, x)
                dv = diff(v, x)
                steps.append(_s(3,
                    "Identificar u y v",
                    f"u = {sym_latex(u)},\\quad v = {sym_latex(v)}",
                    "Identificamos las dos funciones que se multiplican.",
                    rule="Producto",
                    color=C_ACTIVE,
                    highlighted=(
                        f"{tc(C_ACTIVE,'u')} = {tc(C_ACTIVE, sym_latex(u))},\\quad "
                        f"{tc(C_CONST,'v')} = {tc(C_CONST, sym_latex(v))}"
                    ),
                ))
                _up = "u'"
                _vp = "v'"
                steps.append(_s(4,
                    "Calcular u' y v'",
                    f"u' = {sym_latex(du)},\\quad v' = {sym_latex(dv)}",
                    "Derivamos cada factor por separado.",
                    rule="Producto",
                    color=C_CONST,
                    highlighted=(
                        f"{tc(C_ACTIVE, _up)} = {tc(C_ACTIVE, sym_latex(du))},\\quad "
                        f"{tc(C_CONST, _vp)} = {tc(C_CONST, sym_latex(dv))}"
                    ),
                ))
                combine_plain = (
                    f"u'v + uv'"
                    f" = {sym_latex(du)} \\cdot {sym_latex(v)}"
                    f" + {sym_latex(u)} \\cdot {sym_latex(dv)}"
                )
                combine_highlighted = (
                    tc(C_ACTIVE, "u'v") + " + " + tc(C_CONST, "uv'")
                    + f" = {tc(C_ACTIVE, sym_latex(du))} \\cdot {tc(C_CONST, sym_latex(v))}"
                    + f" + {tc(C_ACTIVE, sym_latex(u))} \\cdot {tc(C_CONST, sym_latex(dv))}"
                )
                steps.append(_s(5,
                    "Combinar: u'v + uv'",
                    combine_plain,
                    "Aplicamos la regla del producto y sumamos los dos términos.",
                    rule="Producto",
                    color=C_ACTIVE,
                    highlighted=combine_highlighted,
                ))

        # Chain rule breakdown for composite powers
        elif expr.is_Pow:
            base, exp_val = expr.args
            if not exp_val.has(x) and base != x:
                inner_der = diff(base, x)
                _up2 = "u'"
                _chain_plain = (
                    "\\frac{d}{dx}[u^n]"
                    " = n \\cdot u^{n-1} \\cdot u'"
                )
                _chain_highlighted = (
                    "\\frac{d}{dx}[" + tc(C_ACTIVE, "u") + "^n]"
                    " = n \\cdot " + tc(C_ACTIVE, "u") + "^{n-1} \\cdot " + tc(C_CONST, _up2)
                )
                steps.append(_s(3,
                    "Regla de la cadena",
                    _chain_plain,
                    f"u = {sym_latex(base)},\\quad u' = {sym_latex(inner_der)}",
                    rule="Cadena",
                    color=C_ACTIVE,
                    highlighted=_chain_highlighted,
                ))

        # Sum rule breakdown
        elif expr.is_Add:
            terms = expr.args
            if len(terms) <= 4:
                breakdown_plain = " + ".join(
                    [f"\\frac{{d}}{{dx}}\\left[{sym_latex(t)}\\right]" for t in terms]
                )
                breakdown_highlighted = " + ".join(
                    [f"\\frac{{d}}{{dx}}\\left[{tc(C_ACTIVE, sym_latex(t))}\\right]" for t in terms]
                )
                steps.append(_s(3,
                    "Separar por la regla de la suma",
                    breakdown_plain,
                    "La derivada de una suma es la suma de las derivadas.",
                    rule="Suma",
                    color=C_ACTIVE,
                    highlighted=breakdown_highlighted,
                ))

        derivative = diff(expr, x)
        simplified_der = simplify(derivative)

        steps.append(_s(len(steps)+1,
            "Derivada calculada",
            f"f'(x) = {sym_latex(derivative)}",
            "Aplicamos las reglas y obtenemos el resultado.",
            rule="Resultado",
            color=C_RESULT,
            highlighted=f"f'(x) = {tc(C_RESULT, sym_latex(derivative))}",
        ))

        if simplified_der != derivative:
            steps.append(_s(len(steps)+1,
                "Simplificar el resultado",
                f"f'(x) = {sym_latex(simplified_der)}",
                "Simplificamos la expresión para obtener la forma más compacta.",
                rule="Simplificar",
                color=C_RESULT,
                highlighted=f"f'(x) = {tc(C_RESULT, sym_latex(simplified_der))}",
            ))
            final = simplified_der
        else:
            final = derivative

        return SolveResponse(
            steps=steps,
            result={"type": "derivative", "result": str(final), "latex": sym_latex(final)},
            metadata={"equation_type": "derivative", "processing_time_ms": 0}
        )

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al derivar: {str(e)}")


# ─── Integrals ────────────────────────────────────────────────────────────────

def _classify_integral_rule(expr, x) -> Tuple[str, str]:
    """Return (explanation, rule_pill)."""
    if expr.is_Number or (expr.is_Mul and not expr.has(x)):
        return "Integral de constante: ∫k dx = kx + C", "Constante"
    if expr == x:
        return "Regla de la potencia: ∫x dx = x²/2 + C", "Potencia"
    if expr.is_Pow and not expr.args[1].has(x):
        n = expr.args[1]
        if n == -1:
            return "∫(1/x) dx = ln|x| + C", "Logaritmo"
        return f"Regla de la potencia: ∫xⁿ dx = xⁿ⁺¹/(n+1) + C  (n = {n})", "Potencia"
    if expr.has(sin) or expr.has(cos):
        return "Integral trigonométrica conocida", "Trig"
    if expr.has(exp):
        return "Integral de exponencial: ∫eˣ dx = eˣ + C", "Exponencial"
    if expr.has(log):
        return "Integral de logaritmo (integración por partes)", "Por partes"
    if expr.is_Add:
        return "Linealidad: ∫(f+g) dx = ∫f dx + ∫g dx", "Linealidad"
    if expr.is_Mul:
        parts = [a for a in expr.args if not a.has(x)]
        if parts:
            return "Sacar constante: ∫k·f dx = k·∫f dx", "Constante"
        return "Integración por partes o sustitución", "Por partes"
    return "Regla de integración", "Integración"


def solve_integral(expr_str: str) -> SolveResponse:
    x = symbols('x')
    steps: List[Step] = []

    try:
        raw = expr_str.strip()

        if raw.lower().startswith('integrate('):
            inner = re.sub(r'^integrate\s*\(', '', raw, flags=re.I)
            inner = re.sub(r',\s*x\s*\)$', '', inner)
            inner = re.sub(r',\s*\(x,.*?\)\s*\)$', '', inner)
        elif '∫' in raw:
            inner = raw.replace('∫', '').replace('dx', '').strip()
            stripped = inner.strip()
            if stripped.startswith('(') and stripped.endswith(')'):
                inner = stripped[1:-1]
        else:
            inner = raw

        expr = _safe_parse(inner)

        steps.append(_s(1,
            "Identificar el integrando",
            f"\\int {sym_latex(expr)} \\, dx",
            "Reconocemos la función que vamos a integrar.",
            color=C_ACTIVE,
            highlighted=f"\\int {tc(C_ACTIVE, sym_latex(expr))} \\, dx",
        ))

        rule_expl, rule_pill = _classify_integral_rule(expr, x)
        steps.append(_s(2,
            f"Regla aplicable: {rule_pill}",
            f"\\int {sym_latex(expr)} \\, dx",
            rule_expl,
            rule=rule_pill,
            color=C_ACTIVE,
            highlighted=f"\\int {tc(C_ACTIVE, sym_latex(expr))} \\, dx",
        ))

        # Linearity breakdown
        if expr.is_Add:
            terms = expr.args
            term_integrals = [integrate(t, x) for t in terms]
            colors = [C_ACTIVE, C_CONST, C_RESULT, C_REMOVE]
            breakdown_plain = " + ".join([
                f"\\int {sym_latex(t)} \\, dx"
                for i, t in enumerate(terms)
            ])
            breakdown_highlighted = " + ".join([
                f"\\int {tc(colors[i % len(colors)], sym_latex(t))} \\, dx"
                for i, t in enumerate(terms)
            ])
            steps.append(_s(3,
                "Aplicar la linealidad de la integral",
                breakdown_plain,
                "La integral de una suma es la suma de las integrales.",
                rule="Linealidad",
                color=C_ACTIVE,
                highlighted=breakdown_highlighted,
            ))
            parts_plain = " + ".join([sym_latex(ti) for ti in term_integrals])
            parts_highlighted = " + ".join([
                tc(colors[i % len(colors)], sym_latex(ti))
                for i, ti in enumerate(term_integrals)
            ])
            steps.append(_s(4,
                "Integrar cada término por separado",
                parts_plain + " + C",
                "Aplicamos la regla adecuada a cada término.",
                rule="Potencia",
                color=C_CONST,
                highlighted=parts_highlighted + f" + {tc(C_CTX, 'C')}",
            ))

        # Constant factor
        elif expr.is_Mul:
            consts = [a for a in expr.args if not a.has(x)]
            if consts:
                k = sympy.Mul(*consts)
                rest = sympy.Mul(*[a for a in expr.args if a.has(x)])
                steps.append(_s(3,
                    "Extraer la constante multiplicativa",
                    f"{sym_latex(k)} \\int {sym_latex(rest)} \\, dx",
                    f"Las constantes salen fuera del signo integral. Factor: {sym_latex(k)}",
                    rule="Constante",
                    color=C_CONST,
                    highlighted=(
                        f"{tc(C_CONST, sym_latex(k))} \\int {tc(C_ACTIVE, sym_latex(rest))} \\, dx"
                    ),
                ))

        integral_result = integrate(expr, x)

        if integral_result.has(sympy.Integral):
            raise HTTPException(
                status_code=422,
                detail="No se encontró una antiderivada en forma cerrada para esta expresión."
            )

        simplified_int = simplify(integral_result)

        steps.append(_s(len(steps)+1,
            "Calcular la antiderivada",
            f"\\int {sym_latex(expr)} \\, dx = {sym_latex(integral_result)} + C",
            "Obtenemos la antiderivada exacta. C representa cualquier constante.",
            rule="Resultado",
            color=C_RESULT,
            highlighted=(
                f"\\int {tc(C_ACTIVE, sym_latex(expr))} \\, dx"
                f" = {tc(C_RESULT, sym_latex(integral_result))} + {tc(C_CTX,'C')}"
            ),
        ))

        if simplified_int != integral_result:
            steps.append(_s(len(steps)+1,
                "Simplificar el resultado",
                f"{sym_latex(simplified_int)} + C",
                "Simplificamos la antiderivada a su forma más compacta.",
                rule="Simplificar",
                color=C_RESULT,
                highlighted=f"{tc(C_RESULT, sym_latex(simplified_int))} + {tc(C_CTX,'C')}",
            ))
            final = simplified_int
        else:
            final = integral_result

        final_latex = sym_latex(final) + " + C"

        return SolveResponse(
            steps=steps,
            result={"type": "integral", "result": str(final) + " + C", "latex": final_latex},
            metadata={"equation_type": "integral", "processing_time_ms": 0}
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al integrar: {str(e)}")


# ─── Limits ───────────────────────────────────────────────────────────────────

def solve_limit(expr_str: str) -> SolveResponse:
    x = symbols('x')
    steps: List[Step] = []

    try:
        raw = expr_str.strip()

        match = re.search(r'x\s*->\s*([+-]?(?:inf(?:inity)?|oo|\d+(?:\.\d+)?))', raw, re.I)
        if match:
            pt_str = match.group(1).lower()
            if pt_str in ('inf', 'infinity', 'oo', '+inf', '+infinity', '+oo'):
                point = oo
                point_latex = r'+\infty'
            elif pt_str in ('-inf', '-infinity', '-oo'):
                point = -oo
                point_latex = r'-\infty'
            else:
                point = sympy.parse_expr(pt_str)
                point_latex = sym_latex(point)
        else:
            point = 0
            point_latex = '0'

        func_str = re.sub(r'^lim\s*', '', raw, flags=re.I)
        func_str = re.sub(r'x\s*->\s*[+-]?\s*(?:inf(?:inity)?|oo|\d+(?:\.\d+)?)\s*', '', func_str, flags=re.I).strip()
        # Only strip a single pair of outer parentheses when the whole expression is wrapped
        if func_str.startswith('(') and func_str.endswith(')'):
            depth = 0
            wrapped = True
            for i, ch in enumerate(func_str[:-1]):
                if ch == '(':
                    depth += 1
                elif ch == ')':
                    depth -= 1
                if depth == 0 and i < len(func_str) - 1:
                    wrapped = False
                    break
            if wrapped:
                func_str = func_str[1:-1]

        expr = _safe_parse(func_str)

        steps.append(_s(1,
            "Plantear el límite",
            f"\\lim_{{x \\to {point_latex}}} {sym_latex(expr)}",
            "Identificamos la función y el punto hacia el que tiende x.",
            color=C_ACTIVE,
            highlighted=(
                f"\\lim_{{x \\to {tc(C_CONST, point_latex)}}} {tc(C_ACTIVE, sym_latex(expr))}"
            ),
        ))

        # Direct substitution attempt
        try:
            direct = expr.subs(x, point)
            if direct.is_finite and not direct.has(sympy.nan):
                steps.append(_s(2,
                    "Sustitución directa",
                    f"f\\!\\left({point_latex}\\right) = {sym_latex(direct)}",
                    "Sustituimos directamente. El resultado es finito — sin indeterminación.",
                    rule="Sustitución",
                    color=C_RESULT,
                    highlighted=(
                        f"f\\!\\left({tc(C_CONST, point_latex)}\\right)"
                        f" = {tc(C_RESULT, sym_latex(direct))}"
                    ),
                ))
            else:
                raise ValueError("indeterminate")
        except Exception:
            steps.append(_s(2,
                "Sustitución directa — forma indeterminada",
                r"\text{Forma indeterminada} \left(\frac{0}{0},\ \frac{\infty}{\infty}\ldots\right)",
                "La sustitución directa produce una indeterminación: necesitamos técnicas adicionales.",
                rule="Indeterminada",
                color=C_REMOVE,
                highlighted=(
                    f"\\text{{Forma indeterminada}} \\left("
                    f"{tc(C_REMOVE, r'\frac{0}{0}')},\\ "
                    f"{tc(C_REMOVE, r'\frac{\infty}{\infty}')}\\ldots\\right)"
                ),
            ))

            # L'Hôpital if fraction
            num, den = None, None
            try:
                num_expr, den_expr = sympy.fraction(expr)
                if num_expr != 1 and den_expr != 1:
                    num = num_expr
                    den = den_expr
            except Exception:
                pass

            if num is not None:
                lhopital_plain = (
                    f"\\lim_{{x \\to {point_latex}}}"
                    f" \\frac{{{sym_latex(num)}}}{{{sym_latex(den)}}}"
                    f" = \\lim_{{x \\to {point_latex}}}"
                    f" \\frac{{{sym_latex(diff(num,x))}}}{{{sym_latex(diff(den,x))}}}"
                )
                lhopital_highlighted = (
                    f"\\lim_{{x \\to {tc(C_CONST, point_latex)}}}"
                    f" \\frac{{{tc(C_ACTIVE, sym_latex(num))}}}{{{tc(C_CONST, sym_latex(den))}}}"
                    f" = \\lim_{{x \\to {tc(C_CONST, point_latex)}}}"
                    f" \\frac{{{tc(C_ACTIVE, sym_latex(diff(num,x)))}}}{{{tc(C_CONST, sym_latex(diff(den,x)))}}}"
                )
                steps.append(_s(3,
                    "Aplicar la Regla de L'Hôpital",
                    lhopital_plain,
                    "Como la forma es 0/0 o ∞/∞, derivamos numerador y denominador por separado.",
                    rule="L'Hôpital",
                    color=C_ACTIVE,
                    highlighted=lhopital_highlighted,
                ))

        limit_val = limit(expr, x, point)

        steps.append(_s(len(steps)+1,
            "Resultado del límite",
            f"\\lim_{{x \\to {point_latex}}} {sym_latex(expr)} = {sym_latex(limit_val)}",
            "Valor exacto del límite obtenido.",
            rule="Resultado",
            color=C_RESULT,
            highlighted=(
                f"\\lim_{{x \\to {tc(C_CONST, point_latex)}}}"
                f" {tc(C_ACTIVE, sym_latex(expr))}"
                f" = {tc(C_RESULT, sym_latex(limit_val))}"
            ),
        ))

        return SolveResponse(
            steps=steps,
            result={"type": "limit", "result": str(limit_val), "latex": sym_latex(limit_val)},
            metadata={"equation_type": "limit", "point": str(point), "processing_time_ms": 0}
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al calcular límite: {str(e)}")


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "math-solver-api"}


@app.post("/api/solve", response_model=SolveResponse)
def solve_equation(request: SolveRequest):
    start_time = time.time()

    user_input = request.input.strip()
    if not user_input:
        raise HTTPException(status_code=400, detail="La expresión no puede estar vacía.")
    if len(user_input) > 500:
        raise HTTPException(status_code=400, detail="La expresión es demasiado larga (máx. 500 caracteres).")

    eq_type = detect_equation_type(user_input)

    if eq_type == "derivative":
        response = solve_derivative(user_input)
    elif eq_type == "integral":
        response = solve_integral(user_input)
    elif eq_type == "limit":
        response = solve_limit(user_input)
    else:
        response = solve_algebraic_equation(user_input)

    response.metadata["processing_time_ms"] = int((time.time() - start_time) * 1000)
    return response


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
