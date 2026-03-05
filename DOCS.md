# AsroPAU — Documentación del Código (`duolingo-redesign`)

## Descripción General

**AsroPAU** es una plataforma web para preparar la Selectividad/PAU española. Tiene estética inspirada en Duolingo (gamificación, colores vibrantes, animaciones). La arquitectura es **monorepo** con 3 servicios independientes dockerizados.

---

## Arquitectura

```
AsroPAU/
├── frontend/        → SvelteKit (UI)
├── backend/         → Express + TypeScript (API REST)
├── math-solver/     → FastAPI + Python (microservicio matemático)
└── docker-compose.yml
```

**Flujo de datos:**
```
Usuario → Frontend (SvelteKit :5173)
              ↓
         Backend Node.js (:3000)  ←→  MongoDB (:27017)
              ↓
         Math Solver FastAPI (:8001)
```

---

## 1. Frontend (`frontend/`)

**Stack:** SvelteKit 5 + Svelte Runes + Tailwind CSS + Lucide icons + KaTeX

### Rutas (`src/routes/`)

| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/` | `+page.svelte` | Landing page — ensambla Header, Hero, Features, SpainSection, Footer |
| `/examen` | `examen/+page.svelte` | Banco de exámenes con filtros por asignatura, región y año |
| `/resolutor` | `resolutor/+page.svelte` | Resolutor de matemáticas paso a paso con historial |
| `/calc` | `calc/+page.svelte` | Calculadora de nota PAU (0.6 × bachiller + 0.4 × PAU) |

**Layout global** (`+layout.svelte`): aplica el CSS global, pone el favicon, incluye el `Header` y un enlace "Saltar al contenido" para accesibilidad. Usa `$props()` de Svelte 5 para renderizar hijos.

---

### Componentes (`src/components/`)

#### `Header.svelte`
- Navbar flotante con efecto blur al hacer scroll (`scrolled` state con `window.scrollY > 20`).
- Desktop: pill flotante con logo, links de navegación y botón "Iniciar sesión".
- Mobile: icono hamburguesa que abre el `Sidebar`.
- Links activos detectados via `$page` store de SvelteKit.
- Links: `/examen`, `/media`, `/examenes-ia`, `/resolutor`. El link de "Exámenes IA" tiene badge "NEW".

#### `Sidebar.svelte`
- Drawer deslizante por la derecha para mobile (ancho 288px, fondo `#431407`).
- Usa `$bindable()` para la prop `isOpen` — el padre puede controlarla bidireccionalmente.
- Backdrop semitransparente que cierra el menú al hacer click.
- Divide los links en "Inicio" y "Recursos".

#### `Hero.svelte`
- Sección hero de pantalla completa con 2 versiones: desktop (`hidden md:block`) y mobile (`hidden max-md:flex`).
- **Desktop**: efecto parallax 3D del mapa de España que sigue al ratón (`onmousemove` → `perspective + rotateX/Y`). Tarjetas flotantes animadas en los laterales. Barra de progreso que se anima al cargar.
- **Mobile**: versión simplificada con mapa pequeño y CTA.
- Detecta `prefers-reduced-motion` y desactiva las animaciones si es necesario.
- Badges de prueba social (50k+ estudiantes, 4.9 valoración, #1 en España).

#### `Features.svelte`
- Sección de "herramientas" con 3 tabs: Exámenes, Calculadora, Exámenes IA.
- Al cambiar tab, la tarjeta principal hace `{#key}` para re-animar el componente con `cardIn`.
- Cada feature tiene título, descripción, bullets, imagen SVG y CTA.
- Row de mini-cards debajo que también sirven como selectores de tab.
- Animación de entrada via `IntersectionObserver`.

#### `SpainSection.svelte`
- Sección con fondo degradado naranja oscuro mostrando el mapa de España y chips de comunidades autónomas.
- Los chips aparecen escalonados (`transition-delay: i * 60ms`) cuando la sección entra en viewport.
- Mapa con animación de flotación continua (`spainFloat` keyframe).

#### `Stats.svelte`
- 4 tarjetas con contadores animados (ease-out cubic, 1600ms, 55 pasos).
- Números: 5000+ exámenes, 17 CCAA, 98% satisfacción, 50k+ estudiantes.
- Contador se activa con `IntersectionObserver` (threshold 0.25) — se cuenta solo una vez.

#### `Testimonials.svelte`
- 3 tarjetas de testimonios de estudiantes con nota final, estrellas y avatar.
- Banner CTA al final con gradiente animado (`gradShift` keyframe).

#### `Footer.svelte`
- Grid de 4 columnas: marca + redes sociales, recursos, comunidad, newsletter.
- Input de email para suscripción (sin lógica de backend conectada aún).
- Copyright 2026.

#### `ExamSearch.svelte`
- Componente legacy con selects para Comunidad, Asignatura y Año. Actualmente **no está integrado** en la landing (fue reemplazado por `examen/+page.svelte`).

#### `ToggleDark.svelte`
- Toggle de modo oscuro usando `@skeletonlabs/skeleton-svelte`.
- Persiste la preferencia en `localStorage` y aplica `data-mode` en el `<html>`.

---

### Librería Math Solver (`src/lib/math-solver/`)

Componentes para la interfaz del resolutor matemático.

#### `MathRenderer.svelte`
- Wrapper de **KaTeX** para renderizar expresiones LaTeX.
- Props: `latex` (string), `inline` (boolean).
- Usa `onMount` + `afterUpdate` para re-renderizar cuando cambia el LaTeX.
- En caso de error de KaTeX, muestra el texto plano como fallback.

#### `LatexInput.svelte`
- Campo de texto para introducir expresiones matemáticas en texto plano (sintaxis SymPy).
- Botones de acceso rápido para símbolos comunes: `x²`, `√`, `π`, `sin(`, `d/dx(`, etc.
- Preview en tiempo real usando `MathRenderer` mientras se escribe.
- Emite evento `submit` al pulsar Enter.

#### `MathKeyboard.svelte`
- Teclado visual completo organizado en 4 grupos: Números, Variables/Constantes, Operadores, Funciones/Cálculo.
- Construye la expresión concatenando tokens al valor actual.
- Preview en tiempo real con `MathRenderer`.
- Botones "Borrar" (backspace) y "Limpiar todo".
- Emite evento `change` con el valor actualizado.

#### `StepsSolver.svelte`
- Renderiza la respuesta del API: lista de pasos + resultado final.
- Cada paso tiene: número, descripción, expresión LaTeX (via `MathRenderer`), explicación opcional.
- El último paso tiene estilo verde esmeralda.
- Resultado final en tarjeta naranja con botón "Copiar LaTeX" al portapapeles.
- Animación `fly` de Svelte en cada paso (escalonada 80ms por paso).

---

### Página del Resolutor (`resolutor/+page.svelte`)

- **Historial persistente** en `localStorage` (max 20 entradas, key `math-solver-history`).
- Dos modos de entrada: "Texto / LaTeX" (usa `LatexInput`) y "Teclado" (usa `MathKeyboard`).
- Al resolver, hace `POST /api/solve` al microservicio Python (`VITE_API_URL`).
- Muestra loading spinner, errores, y el resultado via `StepsSolver`.
- Ejemplos clickables para probar rápidamente.

### Página de Exámenes (`examen/+page.svelte`)

- Array de 16 exámenes hardcodeados (datos mock, aún sin backend real).
- Filtros reactivos con **Svelte 5 Runes** (`$state`, `$derived`): búsqueda de texto, asignatura, región, año.
- Grid responsive de tarjetas con badges de dificultad, popularidad y novedad.
- Metadatos por examen: páginas, descargas, rating, tiempo estimado.
- CTA al resolutor en la parte inferior.

### Página Calculadora (`calc/+page.svelte`)

- Lógica mínima: dos inputs numéricos (nota bachillerato y nota PAU).
- Fórmula: `resultado = 0.6 × bachiller + 0.4 × PAU`.
- Sin estilos — es un placeholder/WIP.

---

## 2. Backend (`backend/`)

**Stack:** Express 5 + TypeScript + Winston + dotenv

### Estructura

```
src/
├── app.ts              → Configura Express, middlewares, ruta raíz, manejadores de error
├── server.ts           → Arranca el servidor, captura errores de proceso
├── config/
│   └── index.ts        → Carga .env, exporta objeto config tipado, valida variables requeridas
├── middleware/
│   ├── logger.ts       → Logger Winston (archivo + consola con colores en dev)
│   └── errorHandler.ts → Clase AppError personalizada + middlewares errorHandler y notFoundHandler
└── routes/
    ├── index.ts           → Router principal — monta subrutas
    ├── health.routes.ts   → GET /health — devuelve status, timestamp, uptime
    ├── auth.ts            → (vacío, por implementar)
    ├── exams.ts           → (vacío, por implementar)
    ├── notes.ts           → (vacío, por implementar)
    ├── scores.ts          → (vacío, por implementar)
    ├── universites.ts     → (vacío, por implementar)
    └── users.ts           → (vacío, por implementar)
```

> **Nota:** la mayoría de rutas están vacías. Solo `health.routes.ts` tiene implementación. El backend está en fase inicial de desarrollo.

### `app.ts`
- Aplica `express.json()`, `express.urlencoded()`, `cors()`.
- Ruta raíz `GET /` devuelve JSON de bienvenida con versión y endpoints disponibles.
- **Bug menor**: `import { execArgv } from 'node:process'` importado pero no usado.
- El router de rutas API está importado pero **no montado** con prefijo — falta `app.use(config.apiPrefix, routes)`.

### `config/index.ts`
- Variables: `env`, `port` (default 3000), `apiPrefix` (default `/api/v1`), `corsOrigin`, `logLevel`.
- `validateConfig()` lanza error si falta `PORT`.

### `middleware/errorHandler.ts`
- `AppError`: clase de error con `statusCode` y flag `isOperational`.
- `errorHandler`: middleware de 4 parámetros — si es `AppError` responde con su `statusCode`; si no, responde 500. En dev incluye el stack trace.
- `notFoundHandler`: responde 404 con el método y path que no se encontró.

### `middleware/logger.ts`
- Winston con formato JSON + timestamp + stack traces.
- Guarda `logs/error.log` y `logs/combined.log`.
- En no-producción añade transporte de consola con colores.

---

## 3. Math Solver (`math-solver/`)

**Stack:** FastAPI + SymPy + Pydantic + Uvicorn

### Modelos Pydantic

```python
SolveRequest  → { input: str, mode: str, equation_type: str }
Step          → { step_number, description, expr_latex, explanation }
SolveResponse → { steps: List[Step], result: dict, metadata: dict }
```

### Detección automática de tipo (`detect_equation_type`)

Analiza el string de entrada y devuelve uno de: `"derivative"`, `"integral"`, `"limit"`, `"algebra"`, `"expression"`.

### Funciones de resolución

#### `solve_algebraic_equation(expr_str)`
- Soporta ecuaciones con `=` y expresiones simples.
- Para **ecuaciones**: pasa todo al lado izquierdo, intenta factorizar, analiza el grado polinomial.
  - Grado 2: muestra `a, b, c`, calcula discriminante (Δ), aplica fórmula cuadrática con explicación según signo de Δ.
  - Grado 1: ecuación lineal.
  - Llama a `sympy.solve()` y lista las soluciones.
- Para **expresiones**: expande, factoriza y simplifica.

#### `solve_derivative(expr_str)`
- Soporta sintaxis: `d/dx(expr)`, `diff(expr, x)`, o expresión directa.
- `_classify_diff_rule()`: identifica heurísticamente la regla (suma, producto, cadena, potencia, trigonométrica, logaritmo, exponencial).
- Para productos muestra `u`, `v`, `u'`, `v'` explícitamente.
- Para potencias compuestas muestra la regla de la cadena.
- Calcula `sympy.diff(expr, x)` y simplifica.

#### `solve_integral(expr_str)`
- Soporta: `integrate(f, x)`, `∫f dx`, o expresión directa.
- `_classify_integral_rule()`: identifica la regla (constante, potencia, logaritmo, trigonométrica, exponencial, linealidad, factor constante).
- Para sumas: muestra cada integral por separado (linealidad).
- Para productos con constante: saca el factor fuera.
- Calcula `sympy.integrate(expr, x)`.
- Resultado siempre incluye `+ C`.

#### `solve_limit(expr_str)`
- Soporta: `lim x->a f(x)` donde `a` puede ser número, `inf`, `-inf`, `oo`.
- Intenta sustitución directa primero.
- Si hay forma indeterminada, sugiere aplicar L'Hôpital mostrando derivadas del numerador y denominador.
- Calcula `sympy.limit(expr, x, point)`.

### Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/api/solve` | Resuelve una expresión — detecta tipo y delega a la función correspondiente |

El endpoint `/api/solve` mide el tiempo de procesamiento y lo incluye en `metadata.processing_time_ms`.

---

## 4. Infraestructura (`docker-compose.yml`)

4 servicios en red `asropau-network`:

| Servicio | Puerto | Imagen/Build | Dependencias |
|----------|--------|--------------|--------------|
| `mongo` | 27017 | `mongo:7` | — |
| `math-solver` | 8001 | `./math-solver` | mongo |
| `backend` | 3000 | `./backend` | mongo + math-solver (healthy) |
| `frontend` | 5173 | `./frontend` | backend (healthy) |

Todos tienen `healthcheck`. MongoDB usa volume persistente `mongo_data`.

---

## Estado del Proyecto

| Área | Estado |
|------|--------|
| Frontend landing page | Completo y pulido |
| Página de exámenes | UI completa, datos mock |
| Resolutor matemático | Completo (UI + backend Python) |
| Calculadora de nota | Placeholder/WIP |
| Backend Node.js | Estructura básica, sin lógica de negocio |
| Autenticación | Sin implementar |
| Base de datos | Solo configurada en Docker |
| Exámenes IA | Link en UI, sin implementar |
