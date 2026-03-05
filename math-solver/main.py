from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import sympy
from sympy import (
    symbols, Eq, solve, factor, expand, simplify, diff, integrate, limit,
    Symbol, degree, Poly, sqrt, Rational, latex as sym_latex, oo,
    sin, cos, tan, log, exp, pi, E, Number, count_ops, apart
)
from sympy.core.function import AppliedUndef
import time
import re

app = FastAPI(title="Math Equation Solver API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SolveRequest(BaseModel):
    input: str
    mode: str = "text"
    equation_type: str = "auto"


class Step(BaseModel):
    step_number: int
    description: str
    expr_latex: str
    explanation: Optional[str] = ""


class SolveResponse(BaseModel):
    steps: List[Step]
    result: dict
    metadata: dict


# ─── Helpers ────────────────────────────────────────────────────────────────

def _s(n: int, desc: str, latex_str: str, expl: str = "") -> Step:
    return Step(step_number=n, description=desc, expr_latex=latex_str, explanation=expl)


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


# ─── Algebra ─────────────────────────────────────────────────────────────────

def solve_algebraic_equation(expr_str: str) -> SolveResponse:
    x = symbols('x')
    steps: List[Step] = []

    try:
        if "=" in expr_str:
            left_str, right_str = expr_str.split("=", 1)
            lhs = sympy.parse_expr(left_str.strip(), transformations='all')
            rhs = sympy.parse_expr(right_str.strip(), transformations='all')
            eq = Eq(lhs, rhs)

            steps.append(_s(1, "Ecuación original",
                            f"{sym_latex(lhs)} = {sym_latex(rhs)}",
                            "Identificamos la ecuación a resolver para x."))

            # Move everything to left side
            combined = sympy.expand(lhs - rhs)
            steps.append(_s(2, "Pasar todo al lado izquierdo",
                            f"{sym_latex(combined)} = 0",
                            "Restamos el lado derecho en ambos miembros."))

            # Try to factor
            factored = factor(combined)
            if factored != combined and factored.is_Mul:
                steps.append(_s(3, "Factorizar",
                                f"{sym_latex(factored)} = 0",
                                "Factorizamos la expresión para identificar raíces."))

            # Polynomial degree analysis
            deg = None
            try:
                p = Poly(combined, x)
                deg = p.degree()
                if deg == 2:
                    a_coef = p.nth(2)
                    b_coef = p.nth(1)
                    c_coef = p.nth(0)
                    discriminant = b_coef**2 - 4*a_coef*c_coef
                    steps.append(_s(len(steps)+1, "Identificar coeficientes (ax² + bx + c = 0)",
                                    f"a = {sym_latex(a_coef)},\\quad b = {sym_latex(b_coef)},\\quad c = {sym_latex(c_coef)}",
                                    "Ecuación de segundo grado."))
                    steps.append(_s(len(steps)+1, "Calcular discriminante",
                                    f"\\Delta = b^2 - 4ac = ({sym_latex(b_coef)})^2 - 4({sym_latex(a_coef)})({sym_latex(c_coef)}) = {sym_latex(discriminant)}",
                                    "El discriminante determina el número de soluciones reales."))
                    if discriminant > 0:
                        steps.append(_s(len(steps)+1, "Aplicar fórmula cuadrática",
                                        r"x = \frac{-b \pm \sqrt{\Delta}}{2a}",
                                        "Δ > 0: dos soluciones reales distintas."))
                    elif discriminant == 0:
                        steps.append(_s(len(steps)+1, "Aplicar fórmula cuadrática",
                                        r"x = \frac{-b}{2a}",
                                        "Δ = 0: una solución real (raíz doble)."))
                    else:
                        steps.append(_s(len(steps)+1, "Discriminante negativo",
                                        f"\\Delta = {sym_latex(discriminant)} < 0",
                                        "Δ < 0: no hay soluciones reales."))
                elif deg == 1:
                    steps.append(_s(len(steps)+1, "Ecuación lineal",
                                    sym_latex(combined) + " = 0",
                                    "Despejamos x directamente."))
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
                steps.append(_s(len(steps)+1, f"Solución {i+1}",
                                f"x = {sym_latex(sol)}",
                                f"Verificación: sustituir x = {sym_latex(sol)} en la ecuación original."))

            result_latex = " \\quad\\text{o}\\quad ".join([f"x = {sym_latex(s)}" for s in solutions])
            deg_str = str(deg) if deg is not None else "?"
            return SolveResponse(
                steps=steps,
                result={
                    "type": "equation",
                    "solutions": [str(s) for s in solutions],
                    "latex": result_latex
                },
                metadata={"equation_type": "algebra", "degree": deg_str, "processing_time_ms": 0}
            )

        else:
            # Expression simplification
            expr = sympy.parse_expr(expr_str, transformations='all')
            steps.append(_s(1, "Expresión original", sym_latex(expr), ""))

            expanded_expr = expand(expr)
            if expanded_expr != expr:
                steps.append(_s(2, "Expandir",
                                sym_latex(expanded_expr),
                                "Aplicamos la propiedad distributiva."))

            factored_expr = factor(expr)
            if factored_expr != expr and factored_expr != expanded_expr:
                steps.append(_s(len(steps)+1, "Forma factorizada",
                                sym_latex(factored_expr), ""))

            simplified = simplify(expr)
            steps.append(_s(len(steps)+1, "Simplificado",
                            sym_latex(simplified), "Forma más simple."))

            return SolveResponse(
                steps=steps,
                result={"type": "expression", "result": str(simplified), "latex": sym_latex(simplified)},
                metadata={"equation_type": "expression", "processing_time_ms": 0}
            )

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al resolver: {str(e)}")


# ─── Derivatives ─────────────────────────────────────────────────────────────

def _classify_diff_rule(expr, x) -> str:
    """Heuristically identify which differentiation rule applies."""
    if expr.is_Add:
        return "Regla de la suma/diferencia"
    if expr.is_Mul and len(expr.args) == 2:
        u, v = expr.args
        if not u.has(x):
            return "Regla del múltiplo constante"
        return "Regla del producto"
    if expr.is_Pow:
        base, exp_val = expr.args
        if not exp_val.has(x):
            if base == x:
                return f"Regla de la potencia: d/dx(xⁿ) = n·xⁿ⁻¹"
            return "Regla de la cadena + potencia"
        return "Regla de la cadena"
    if expr.has(sin) or expr.has(cos) or expr.has(tan):
        return "Derivada de función trigonométrica"
    if expr.has(log):
        return "Derivada de logaritmo"
    if expr.has(exp):
        return "Derivada de exponencial"
    return "Regla de derivación"


def solve_derivative(expr_str: str) -> SolveResponse:
    x = symbols('x')
    steps: List[Step] = []

    try:
        # Parse input: support "d/dx(...)", "diff(...,x)", or bare expression
        raw = expr_str.strip()
        if raw.lower().startswith('d/dx(') and raw.endswith(')'):
            inner = raw[5:-1]
        elif raw.lower().startswith('diff('):
            inner = re.sub(r'^diff\s*\(', '', raw, flags=re.I)
            inner = re.sub(r',\s*x\s*\)$', '', inner)
        else:
            inner = raw

        expr = sympy.parse_expr(inner, transformations='all')

        steps.append(_s(1, "Función original",
                        f"f(x) = {sym_latex(expr)}",
                        "Identificamos la función a derivar."))

        # Identify rule
        rule = _classify_diff_rule(expr, x)
        steps.append(_s(2, f"Regla aplicable: {rule}",
                        f"\\frac{{d}}{{dx}}\\left[{sym_latex(expr)}\\right]",
                        "Seleccionamos la regla de derivación adecuada."))

        # Show sub-expression breakdown for products/chains
        if expr.is_Mul and len(expr.args) == 2:
            u, v = expr.args
            if u.has(x) and v.has(x):
                du = diff(u, x)
                dv = diff(v, x)
                steps.append(_s(3, "Aplicar regla del producto: (uv)' = u'v + uv'",
                                f"u = {sym_latex(u)},\\quad v = {sym_latex(v)}",
                                ""))
                steps.append(_s(4, "Derivadas parciales",
                                f"u' = {sym_latex(du)},\\quad v' = {sym_latex(dv)}",
                                ""))

        elif expr.is_Pow:
            base, exp_val = expr.args
            if not exp_val.has(x) and base != x:
                inner_der = diff(base, x)
                steps.append(_s(3, "Regla de la cadena",
                                f"\\frac{{d}}{{dx}}[u^n] = n \\cdot u^{{n-1}} \\cdot u'",
                                f"u = {sym_latex(base)},\\quad u' = {sym_latex(inner_der)}"))

        derivative = diff(expr, x)
        simplified_der = simplify(derivative)

        steps.append(_s(len(steps)+1, "Derivada calculada",
                        f"f'(x) = {sym_latex(derivative)}",
                        "Aplicamos las reglas de derivación."))

        if simplified_der != derivative:
            steps.append(_s(len(steps)+1, "Simplificar resultado",
                            f"f'(x) = {sym_latex(simplified_der)}",
                            "Simplificamos la expresión resultante."))
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

def _classify_integral_rule(expr, x) -> str:
    if expr.is_Number or (expr.is_Mul and not expr.has(x)):
        return "Integral de constante: ∫k dx = kx + C"
    if expr == x:
        return "Regla de la potencia: ∫x dx = x²/2 + C"
    if expr.is_Pow and not expr.args[1].has(x):
        n = expr.args[1]
        if n == -1:
            return "∫(1/x) dx = ln|x| + C"
        return f"Regla de la potencia: ∫xⁿ dx = xⁿ⁺¹/(n+1) + C  (n = {n})"
    if expr.has(sin) or expr.has(cos):
        return "Integral trigonométrica"
    if expr.has(exp):
        return "Integral de exponencial: ∫eˣ dx = eˣ + C"
    if expr.has(log):
        return "Integral de logaritmo (integración por partes)"
    if expr.is_Add:
        return "Linealidad: ∫(f+g) dx = ∫f dx + ∫g dx"
    if expr.is_Mul:
        parts = [a for a in expr.args if not a.has(x)]
        if parts:
            return "Sacar constante fuera: ∫k·f dx = k·∫f dx"
        return "Integración por partes o sustitución"
    return "Regla de integración"


def solve_integral(expr_str: str) -> SolveResponse:
    x = symbols('x')
    steps: List[Step] = []

    try:
        raw = expr_str.strip()

        # Parse: "integrate(f, x)", "∫f dx", or bare expression
        if raw.lower().startswith('integrate('):
            inner = re.sub(r'^integrate\s*\(', '', raw, flags=re.I)
            inner = re.sub(r',\s*x\s*\)$', '', inner)
        elif '∫' in raw:
            inner = raw.replace('∫', '').replace('dx', '').strip()
            if '(' in inner:
                inner = inner.split('(', 1)[1].rsplit(')', 1)[0]
        else:
            inner = raw

        expr = sympy.parse_expr(inner, transformations='all')

        steps.append(_s(1, "Integrando",
                        f"\\int {sym_latex(expr)} \\, dx",
                        "Identificamos la función a integrar."))

        rule = _classify_integral_rule(expr, x)
        steps.append(_s(2, "Regla aplicable",
                        f"\\int {sym_latex(expr)} \\, dx",
                        rule))

        # Additivity breakdown
        if expr.is_Add:
            terms = expr.args
            term_integrals = [integrate(t, x) for t in terms]
            breakdown = " + ".join([f"\\int {sym_latex(t)} \\, dx" for t in terms])
            steps.append(_s(3, "Separar por linealidad",
                            breakdown,
                            "Integramos cada término por separado."))
            parts_str = " + ".join([sym_latex(ti) for ti in term_integrals])
            steps.append(_s(4, "Integrar cada término",
                            parts_str + " + C", ""))

        # Constant factor
        elif expr.is_Mul:
            consts = [a for a in expr.args if not a.has(x)]
            if consts:
                k = sympy.Mul(*consts)
                rest = sympy.Mul(*[a for a in expr.args if a.has(x)])
                steps.append(_s(3, "Sacar la constante",
                                f"{sym_latex(k)} \\int {sym_latex(rest)} \\, dx",
                                f"Factor constante: {sym_latex(k)}"))

        integral_result = integrate(expr, x)
        simplified_int = simplify(integral_result)

        steps.append(_s(len(steps)+1, "Antiderivada calculada",
                        f"\\int {sym_latex(expr)} \\, dx = {sym_latex(integral_result)} + C",
                        "SymPy calcula la antiderivada exacta."))

        if simplified_int != integral_result:
            steps.append(_s(len(steps)+1, "Forma simplificada",
                            f"{sym_latex(simplified_int)} + C", ""))
            final = simplified_int
        else:
            final = integral_result

        final_latex = sym_latex(final) + " + C"

        return SolveResponse(
            steps=steps,
            result={"type": "integral", "result": str(final) + " + C", "latex": final_latex},
            metadata={"equation_type": "integral", "processing_time_ms": 0}
        )

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al integrar: {str(e)}")


# ─── Limits ───────────────────────────────────────────────────────────────────

def solve_limit(expr_str: str) -> SolveResponse:
    x = symbols('x')
    steps: List[Step] = []

    try:
        raw = expr_str.strip()

        # Parse "lim x->a f(x)"
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

        # Remove the "lim x->a" prefix to get the function
        func_str = re.sub(r'^lim\s*', '', raw, flags=re.I)
        func_str = re.sub(r'x\s*->\s*[+-]?(?:inf(?:inity)?|oo|\d+(?:\.\d+)?)\s*', '', func_str, flags=re.I).strip()
        func_str = func_str.strip('()')

        expr = sympy.parse_expr(func_str, transformations='all')

        steps.append(_s(1, "Límite a calcular",
                        f"\\lim_{{x \\to {point_latex}}} {sym_latex(expr)}",
                        "Identificamos la función y el punto de aproximación."))

        # Try direct substitution
        try:
            direct = expr.subs(x, point)
            if direct.is_finite and not direct.has(sympy.nan):
                steps.append(_s(2, "Sustitución directa",
                                f"f({point_latex}) = {sym_latex(direct)}",
                                "Sustituimos directamente x por el valor del límite."))
        except Exception:
            steps.append(_s(2, "Sustitución directa",
                            "\\text{Forma indeterminada — se requiere análisis}",
                            "La sustitución directa produce una indeterminación."))

            # Try L'Hôpital hint
            num, den = None, None
            if expr.is_Mul:
                pass
            try:
                num_expr, den_expr = sympy.fraction(expr)
                if num_expr != 1:
                    num = num_expr
                    den = den_expr
            except Exception:
                pass

            if num is not None:
                steps.append(_s(3, "Aplicar la Regla de L'Hôpital",
                                f"\\lim_{{x \\to {point_latex}}} \\frac{{{sym_latex(num)}}}{{{sym_latex(den)}}} = \\lim_{{x \\to {point_latex}}} \\frac{{{sym_latex(diff(num,x))}}}{{{sym_latex(diff(den,x))}}}",
                                "d/dx del numerador sobre d/dx del denominador."))

        limit_val = limit(expr, x, point)

        steps.append(_s(len(steps)+1, "Resultado del límite",
                        f"\\lim_{{x \\to {point_latex}}} {sym_latex(expr)} = {sym_latex(limit_val)}",
                        "Valor exacto calculado por SymPy."))

        return SolveResponse(
            steps=steps,
            result={"type": "limit", "result": str(limit_val), "latex": sym_latex(limit_val)},
            metadata={"equation_type": "limit", "point": str(point), "processing_time_ms": 0}
        )

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al calcular límite: {str(e)}")


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "math-solver-api"}


@app.post("/api/solve", response_model=SolveResponse)
def solve_equation(request: SolveRequest):
    start_time = time.time()

    eq_type = detect_equation_type(request.input)

    if eq_type == "derivative":
        response = solve_derivative(request.input)
    elif eq_type == "integral":
        response = solve_integral(request.input)
    elif eq_type == "limit":
        response = solve_limit(request.input)
    else:
        response = solve_algebraic_equation(request.input)

    response.metadata["processing_time_ms"] = int((time.time() - start_time) * 1000)
    return response


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
