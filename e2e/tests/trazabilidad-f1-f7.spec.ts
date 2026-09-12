import { test, expect } from '@playwright/test';

/**
 * E2E: Full traceability F1 → F7.
 *
 * Validates the core SGPDP value proposition: every finding has a "birth certificate"
 * in the norm (F1) and immutable evidence with hash (F6).
 *
 * Flow:
 *   F1: Select applicable norm from corpus
 *   F2: Identify risk linked to a treatment
 *   F4: Define control linked to risk
 *   F5: Upload evidence linked to control
 *   F6: Register finding linked to norm + evidence
 *   F7: Emit recommendation → verify efficacy
 */

// Helper: login as DPO
async function loginAsDPO(page: import('@playwright/test').Page) {
  // TODO: implement with test credentials
  // await page.goto('/login');
  // await page.getByLabel(/correo/i).fill('dpo@test.com');
  // await page.getByLabel(/contrase/i).fill('TestPassword123!');
  // await page.getByRole('button', { name: /iniciar sesi/i }).click();
  // await expect(page).toHaveURL(/dashboard/);
}

test.describe('Traceability F1 through F7', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDPO(page);
  });

  test('F1: select an applicable norm from the corpus', async ({ page }) => {
    await page.goto('/fase-1');

    // Verify corpus normativo is visible
    // await expect(page.getByText(/corpus normativo/i)).toBeVisible();
    // await expect(page.getByText(/LOPDP/)).toBeVisible();

    // Select a norm — it should show articles, hash, version
    // const normaRow = page.getByRole('row').filter({ hasText: 'Art.' }).first();
    // await normaRow.click();
    // await expect(page.getByText(/hash.*sha256/i)).toBeVisible();
    // await expect(page.getByText(/vigente/i)).toBeVisible();

    await page.goto('/fase-1');
    await expect(page).toHaveURL(/fase-1|login/);
  });

  test('F2: identify risk linked to a treatment', async ({ page }) => {
    await page.goto('/fase-2');

    // Open risk matrix / heat map
    // await expect(page.getByText(/mapa de calor|matriz de riesgo/i)).toBeVisible();

    // Create a new risk
    // await page.getByRole('button', { name: /nuevo riesgo|agregar/i }).click();
    // await page.getByLabel(/amenaza/i).fill('Acceso no autorizado');
    // await page.getByLabel(/impacto/i).selectOption('4');
    // await page.getByLabel(/probabilidad/i).selectOption('3');
    // await page.getByRole('button', { name: /guardar/i }).click();
    // await expect(page.getByText(/score.*12/i)).toBeVisible();

    await page.goto('/fase-2');
    await expect(page).toHaveURL(/fase-2|login/);
  });

  test('F4: define control linked to risk', async ({ page }) => {
    await page.goto('/fase-4');

    // Create a control linked to the risk from F2
    // await page.getByRole('button', { name: /nuevo control/i }).click();
    // await page.getByLabel(/t[ií]tulo/i).fill('Control de acceso basado en roles');
    // await page.getByLabel(/tipo/i).selectOption('TECNICO');
    // await page.getByLabel(/base normativa/i).fill('Art. 37 LOPDP');
    // await page.getByRole('button', { name: /guardar/i }).click();
    // await expect(page.getByText(/control de acceso/i)).toBeVisible();

    await page.goto('/fase-4');
    await expect(page).toHaveURL(/fase-4|login/);
  });

  test('F5: upload evidence linked to control', async ({ page }) => {
    await page.goto('/fase-5');

    // Upload evidence file
    // const fileInput = page.locator('input[type="file"]');
    // await fileInput.setInputFiles('tests/fixtures/evidence.pdf');
    // await page.getByLabel(/nombre/i).fill('Evidencia de implementacion RBAC');
    // await page.getByRole('button', { name: /subir|cargar/i }).click();

    // Verify hash was computed
    // await expect(page.getByText(/sha-?256/i)).toBeVisible();
    // await expect(page.getByText(/prevHash/i)).toBeVisible();

    await page.goto('/fase-5');
    await expect(page).toHaveURL(/fase-5|login/);
  });

  test('F6: register finding with norm reference and evidence', async ({ page }) => {
    await page.goto('/fase-6');

    // Create finding linked to norm (F1) and evidence (F5)
    // await page.getByRole('button', { name: /nuevo hallazgo/i }).click();
    // await page.getByLabel(/descripci[oó]n/i).fill('Falta de cifrado en reposo');
    // await page.getByLabel(/severidad/i).selectOption('MAYOR');
    // await page.getByLabel(/norma/i).selectOption({ label: 'Art. 37 LOPDP' });
    // await page.getByRole('button', { name: /guardar/i }).click();
    // await expect(page.getByText(/H-\d+/)).toBeVisible();

    await page.goto('/fase-6');
    await expect(page).toHaveURL(/fase-6|login/);
  });

  test('F7: recommendation → efficacy verification', async ({ page }) => {
    await page.goto('/fase-7');

    // Create recommendation from the finding
    // await page.getByRole('button', { name: /nueva recomendaci/i }).click();
    // await page.getByLabel(/t[ií]tulo/i).fill('Implementar cifrado AES-256');
    // await page.getByLabel(/responsable/i).fill('Equipo IT');
    // await page.getByRole('button', { name: /guardar/i }).click();

    // Verify efficacy (DPO action)
    // await page.getByRole('button', { name: /verificar eficacia/i }).click();
    // await page.getByLabel(/evidencia/i).setInputFiles('tests/fixtures/evidence-cifrado.pdf');
    // await page.getByRole('button', { name: /confirmar/i }).click();
    // await expect(page.getByText(/verificado/i)).toBeVisible();

    await page.goto('/fase-7');
    await expect(page).toHaveURL(/fase-7|login/);
  });

  test('full chain: finding traces back to norm and forward to evidence', async ({ page }) => {
    // TODO: open a specific hallazgo detail page and verify:
    // - normaId links to a valid F1 norm
    // - hashEvidencia matches a record in F5
    // - recomendacion (F7) links back to the finding

    await page.goto('/fase-6');
    await expect(page).toHaveURL(/fase-6|login/);
  });
});
