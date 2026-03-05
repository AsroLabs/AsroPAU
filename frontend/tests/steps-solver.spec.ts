import { test, expect, type Page } from '@playwright/test'

const BASE = 'http://localhost:5174'
const API  = 'http://localhost:8001'

// ── helpers ─────────────────────────────────────────────────────────────────

async function solveProblem(page: Page, input: string) {
  await page.goto(`${BASE}/resolutor`)
  // The text input for the equation
  const field = page.locator('input[type="text"], textarea').first()
  await field.fill(input)
  // Submit button or Enter key
  const submitBtn = page.locator('button[type="submit"], button:has-text("Resolver"), button:has-text("resolver")').first()
  if (await submitBtn.isVisible()) {
    await submitBtn.click()
  } else {
    await field.press('Enter')
  }
}

// ── Test 1: API responds with steps ─────────────────────────────────────────
test('API /api/solve returns steps with rule_name and highlight_color', async ({ request }) => {
  const res = await request.post(`${API}/api/solve`, {
    data: { input: '2x + 4 = 10', mode: 'text', equation_type: 'auto' }
  })
  expect(res.ok()).toBeTruthy()
  const body = await res.json()

  expect(body.steps).toBeDefined()
  expect(body.steps.length).toBeGreaterThan(0)
  expect(body.result).toBeDefined()

  const step = body.steps[0]
  expect(step).toHaveProperty('step_number')
  expect(step).toHaveProperty('expr_latex')
  expect(step).toHaveProperty('description')
  // New fields from our backend work
  expect(step).toHaveProperty('highlight_color')
  expect(step).toHaveProperty('rule_name')
})

// ── Test 2: Page loads and renders ──────────────────────────────────────────
test('Resolutor page loads without JS errors', async ({ page }) => {
  const jsErrors: string[] = []
  page.on('pageerror', err => jsErrors.push(err.message))
  page.on('console', msg => {
    if (msg.type() === 'error') jsErrors.push(msg.text())
  })

  await page.goto(`${BASE}/resolutor`)
  await page.waitForLoadState('networkidle')

  // No JS runtime errors
  expect(jsErrors).toHaveLength(0)

  // Input is present
  const input = page.locator('input[type="text"], textarea').first()
  await expect(input).toBeVisible()
})

// ── Test 3: Solving renders the StepsSolver section ─────────────────────────
test('Solving an equation renders the step-by-step section', async ({ page }) => {
  const jsErrors: string[] = []
  page.on('pageerror', err => jsErrors.push(err.message))

  await solveProblem(page, '2x + 4 = 10')

  // Wait for the aria-live region that StepsSolver renders into
  const stepsSection = page.locator('section[aria-label="Resolución paso a paso"]')
  await expect(stepsSection).toBeVisible({ timeout: 10000 })

  // No JS errors occurred
  expect(jsErrors).toHaveLength(0)
})

// ── Test 4: Steps actually appear (MorphSolver single-box) ──────────────────
test('At least one step card appears after solving', async ({ page }) => {
  const jsErrors: string[] = []
  page.on('pageerror', err => jsErrors.push(err.message))

  await solveProblem(page, '2x + 4 = 10')

  // MorphSolver renders a single morphing math box with class .math-box
  const morphBox = page.locator('section[aria-label="Resolución paso a paso"] .math-box').first()
  await expect(morphBox).toBeVisible({ timeout: 10000 })

  expect(jsErrors).toHaveLength(0)
})

// ── Test 5: KaTeX math renders (not raw LaTeX text) ──────────────────────────
test('Math expressions render as KaTeX HTML (not raw LaTeX)', async ({ page }) => {
  const jsErrors: string[] = []
  page.on('pageerror', err => jsErrors.push(err.message))

  await solveProblem(page, 'x^2 - 5x + 6 = 0')

  // Wait for steps to appear
  await page.locator('section[aria-label="Resolución paso a paso"]').waitFor({ timeout: 10000 })

  // Wait for at least one KaTeX-rendered element (KaTeX produces .katex spans)
  const katexEl = page.locator('.katex').first()
  await expect(katexEl).toBeVisible({ timeout: 8000 })

  // The raw LaTeX string should NOT be visible as plain text in the step area
  // (e.g. "\textcolor" should not appear as a literal string)
  const bodyText = await page.locator('section[aria-label="Resolución paso a paso"]').innerText()
  expect(bodyText).not.toContain('\\textcolor')
  expect(bodyText).not.toContain('\\frac')

  expect(jsErrors).toHaveLength(0)
})

// ── Test 6: Progress dots advance over time (single-box animation) ───────────
test('Multiple step cards appear sequentially', async ({ page }) => {
  const jsErrors: string[] = []
  page.on('pageerror', err => jsErrors.push(err.message))

  await solveProblem(page, 'x^2 - 5x + 6 = 0')

  const section = page.locator('section[aria-label="Resolución paso a paso"]')
  await expect(section).toBeVisible({ timeout: 10000 })

  // MorphSolver uses a single morphing box — steps are shown one at a time.
  // Progress dots (button[aria-current="step"]) advance through the sequence.
  // After 4s we should be past step 1 — the active dot should exist and move.
  await page.waitForTimeout(4000)

  // There should be progress dots rendered (multiple steps → multiple dots)
  const dots = page.locator('section[aria-label="Resolución paso a paso"] button[title^="Paso"]')
  const dotCount = await dots.count()
  expect(dotCount).toBeGreaterThanOrEqual(3)

  expect(jsErrors).toHaveLength(0)
})

// ── Test 7: Result card appears at the end ───────────────────────────────────
test('Result card appears after all steps', async ({ page }) => {
  const jsErrors: string[] = []
  page.on('pageerror', err => jsErrors.push(err.message))

  await solveProblem(page, '2x + 4 = 10')

  // 2x+4=10 gives 5 steps → total animation ~5 * 1.12s + 0.38s ≈ 6s
  // Wait up to 12s for "Resultado final" to appear
  const resultCard = page.locator('text=Resultado final')
  await expect(resultCard).toBeVisible({ timeout: 12000 })

  // The result math should be rendered as KaTeX
  const katexInResult = page.locator('.rounded-2xl .katex').first()
  await expect(katexInResult).toBeVisible()

  expect(jsErrors).toHaveLength(0)
})

// ── Test 8: Card slide-in animation — card has non-zero opacity when visible ──
test('Step cards have correct opacity (not invisible due to broken transform)', async ({ page }) => {
  const jsErrors: string[] = []
  page.on('pageerror', err => jsErrors.push(err.message))

  await solveProblem(page, '2x + 4 = 10')

  // Wait for first step card to appear
  const section = page.locator('section[aria-label="Resolución paso a paso"]')
  await expect(section).toBeVisible({ timeout: 10000 })

  // Wait a bit for spring animation to settle
  await page.waitForTimeout(2000)

  // Find the morphing math box (MorphSolver uses .math-box class, rounded-2xl border-2)
  // and check its computed opacity is not 0
  const firstCard = page.locator('section[aria-label="Resolución paso a paso"] .math-box').first()
  await expect(firstCard).toBeVisible()

  const opacity = await firstCard.evaluate(el => {
    return parseFloat(window.getComputedStyle(el).opacity)
  })
  // Opacity should be > 0 — proves the element is rendering (not stuck invisible).
  // In MorphSolver the box animates continuously so it may be mid-transition;
  // any non-zero opacity confirms the animation is working.
  expect(opacity).toBeGreaterThan(0)

  expect(jsErrors).toHaveLength(0)
})

// ── Test 9: Manual mode button works ─────────────────────────────────────────
test('Switching to Manual mode shows Siguiente button', async ({ page }) => {
  const jsErrors: string[] = []
  page.on('pageerror', err => jsErrors.push(err.message))

  await solveProblem(page, '2x + 4 = 10')

  // Wait for header with Auto/Manual toggle
  const manualBtn = page.locator('button:has-text("Manual")')
  await expect(manualBtn).toBeVisible({ timeout: 10000 })
  await manualBtn.click()

  // "Siguiente →" button should appear
  const nextBtn = page.locator('button:has-text("Siguiente")')
  await expect(nextBtn).toBeVisible({ timeout: 3000 })

  expect(jsErrors).toHaveLength(0)
})

// ── Test 10: Rule name pills appear ──────────────────────────────────────────
test('Rule name pills are rendered on step cards', async ({ page }) => {
  const jsErrors: string[] = []
  page.on('pageerror', err => jsErrors.push(err.message))

  await solveProblem(page, 'x^2 - 5x + 6 = 0')

  const section = page.locator('section[aria-label="Resolución paso a paso"]')
  await expect(section).toBeVisible({ timeout: 10000 })

  // Wait for steps to start animating
  await page.waitForTimeout(3000)

  // MorphSolver renders a rule pill (span.rounded-full) next to the description.
  // Also the step number badge is a span.rounded-full.
  // At minimum we should see the step badge — verify by checking a span with
  // text content that looks like a rule name (not just a digit).
  // Poll through enough steps to catch at least one with a rule_name.
  let foundRulePill = false
  for (let i = 0; i < 20; i++) {
    const pills = section.locator('span.rounded-full')
    const count = await pills.count()
    for (let j = 0; j < count; j++) {
      const text = await pills.nth(j).innerText()
      // Rule pills contain more than a single digit/char
      if (text.length > 2) { foundRulePill = true; break }
    }
    if (foundRulePill) break
    await page.waitForTimeout(500)
  }
  expect(foundRulePill).toBe(true)

  expect(jsErrors).toHaveLength(0)
})

// ── Test 11: API returns highlighted_latex field ──────────────────────────────
test('API returns highlighted_latex with \\textcolor on active sub-expressions', async ({ request }) => {
  const res = await request.post(`${API}/api/solve`, {
    data: { input: '2x + 4 = 10', mode: 'text', equation_type: 'auto' }
  })
  expect(res.ok()).toBeTruthy()
  const body = await res.json()

  // Every step must have both fields
  for (const step of body.steps) {
    expect(step).toHaveProperty('expr_latex')
    expect(step).toHaveProperty('highlighted_latex')
  }

  // expr_latex must be clean (no \textcolor)
  const firstStep = body.steps[0]
  expect(firstStep.expr_latex).not.toContain('\\textcolor')

  // highlighted_latex must contain \textcolor on at least the first step
  // (step 1 highlights both sides of the equation)
  expect(firstStep.highlighted_latex).toContain('\\textcolor')
})

// ── Test 12: Active step renders colored KaTeX (highlighted_latex used) ───────
test('Active step card shows colored KaTeX sub-expressions', async ({ page }) => {
  const jsErrors: string[] = []
  page.on('pageerror', err => jsErrors.push(err.message))

  await solveProblem(page, '2x + 4 = 10')

  const section = page.locator('section[aria-label="Resolución paso a paso"]')
  await expect(section).toBeVisible({ timeout: 10000 })

  // The first step enters its highlight phase ~320ms after appearing.
  // Wait for a bit — .math-box.is-highlighted should exist with colored spans.
  // We need to wait for the highlight phase of the first step.
  await page.waitForTimeout(1200)

  // MorphSolver uses .math-box.is-highlighted during the highlight phase
  let found = false
  for (let i = 0; i < 16; i++) {
    const activeWrap = page.locator('.math-box.is-highlighted')
    const count = await activeWrap.count()
    if (count > 0) {
      // Check that this active wrap has a colored span inside (from \textcolor)
      const coloredSpan = activeWrap.locator('[style*="color:"]').first()
      if (await coloredSpan.count() > 0) {
        found = true
        break
      }
    }
    await page.waitForTimeout(500)
  }

  expect(found).toBe(true)
  expect(jsErrors).toHaveLength(0)
})
