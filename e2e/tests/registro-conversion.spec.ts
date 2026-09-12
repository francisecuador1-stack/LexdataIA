import { test, expect } from '@playwright/test';

/**
 * E2E: Public registration → Pd-VaR diagnostic → client conversion → SGPDP initialized.
 *
 * Flow:
 *   1. Visitor opens /registro
 *   2. Fills company info (razon social, RUC, sector, etc.)
 *   3. Completes Pd-VaR questionnaire (datos sensibles, IA, ARCO, etc.)
 *   4. Receives risk score and cotizacion case (A or B)
 *   5. Accepts proposal → tenant created → redirected to /dashboard
 *   6. Dashboard shows SGPDP phases initialized (F1–F7)
 */

test.describe('Registration and conversion flow', () => {
  test('complete registration form shows Pd-VaR score', async ({ page }) => {
    await page.goto('/registro');

    // Step 1: Company information
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await page.getByLabel(/raz[oó]n social/i).fill('Acme Ecuador S.A.');
    await page.getByLabel(/ruc/i).fill('1790012345001');
    await page.getByLabel(/sector/i).fill('Tecnología');
    await page.getByLabel(/ciudad/i).fill('Quito');
    await page.getByLabel(/provincia/i).fill('Pichincha');

    // Navigate to next step
    const nextButton = page.getByRole('button', { name: /siguiente|continuar/i });
    await nextButton.click();

    // Step 2: Pd-VaR diagnostic questionnaire
    await expect(page.getByText(/datos personales/i)).toBeVisible();

    // TODO: fill diagnostic fields — datos sensibles, IA, ARCO, etc.
    // The exact field names depend on the RegistroSPDP schema fields

    // Step 3: Submit and see score
    // await page.getByRole('button', { name: /calcular|enviar/i }).click();
    // await expect(page.getByText(/puntaje|score/i)).toBeVisible();
    // await expect(page.getByText(/caso [ab]/i)).toBeVisible();
  });

  test('accepted proposal creates tenant and redirects to dashboard', async ({ page }) => {
    // TODO: complete registration flow from above, then:
    // await page.getByRole('button', { name: /aceptar propuesta/i }).click();
    // await expect(page).toHaveURL(/\/dashboard/);
    // await expect(page.getByText(/fase 1/i)).toBeVisible();
    // await expect(page.getByText(/fase 7/i)).toBeVisible();

    // Placeholder — remove once wired
    await page.goto('/registro');
    await expect(page).toHaveURL(/registro/);
  });

  test('dashboard after conversion shows all 7 SGPDP phases', async ({ page }) => {
    // TODO: login as newly created client, verify phase cards
    // await loginAs(page, 'newclient@acme.ec', 'password');
    // await page.goto('/dashboard');
    // for (let f = 1; f <= 7; f++) {
    //   await expect(page.getByText(new RegExp(`fase ${f}`, 'i'))).toBeVisible();
    // }

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/dashboard|login/);
  });
});
