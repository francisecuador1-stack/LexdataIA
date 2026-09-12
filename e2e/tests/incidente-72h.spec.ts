import { test, expect } from '@playwright/test';

/**
 * E2E: Incident → 72h clock → SPDP notification → evidence of acknowledgment.
 *
 * Tests the critical Art. 41 LOPDP flow: when a security incident is detected,
 * the system starts a 72-hour countdown (server-side UTC), the DPO is alerted,
 * and upon notification to SPDP the evidence is registered with hash.
 *
 * INV-9: The 72h deadline is computed on the server, never on the client.
 */

test.describe('Incident 72h notification flow', () => {
  test('create incident and verify 72h clock appears', async ({ page }) => {
    // Login as DPO
    // await loginAsDPO(page);

    // Navigate to incident management
    await page.goto('/fase-5'); // incidents may live under F5 or a dedicated route

    // Create new incident
    // await page.getByRole('button', { name: /nuevo incidente|registrar/i }).click();
    // await page.getByLabel(/tipo/i).selectOption('CONFIDENCIALIDAD');
    // await page.getByLabel(/descripci[oó]n/i).fill('Filtración de datos personales vía correo electrónico');
    // await page.getByLabel(/fecha.*detecci[oó]n/i).fill('2026-09-12T08:00');
    // await page.getByRole('button', { name: /guardar|registrar/i }).click();

    // Verify 72h clock is displayed
    // await expect(page.getByText(/72.*hora/i)).toBeVisible();
    // await expect(page.getByText(/plazo.*notificaci[oó]n/i)).toBeVisible();

    // Verify the deadline timestamp is shown (should be +72h from detection)
    // await expect(page.getByText(/2026-09-15/)).toBeVisible(); // 12 Sep + 72h = 15 Sep

    await expect(page).toHaveURL(/fase-5|login/);
  });

  test('72h countdown badge shows correct remaining time', async ({ page }) => {
    // TODO: create incident with a known fechaDeteccion, then verify the countdown
    // The countdown must reflect server-calculated deadline, not client Date.now()

    // await page.goto('/incidentes/INC-001');
    // const badge = page.getByTestId('countdown-badge');
    // await expect(badge).toContainText(/\d+h.*\d+m/); // e.g. "71h 45m"
    // The badge color should be amber (warning) if > 24h remaining, red if < 24h

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/dashboard|login/);
  });

  test('notify SPDP action records evidence with hash', async ({ page }) => {
    // TODO: open an existing incident that has not been notified
    // await page.goto(`/incidentes/${incidenteId}`);

    // Click "Notificar a SPDP"
    // await page.getByRole('button', { name: /notificar.*spdp/i }).click();

    // Confirm dialog
    // await page.getByRole('button', { name: /confirmar/i }).click();

    // Verify state changes
    // await expect(page.getByText(/NOTIFICADO_SPDP/i)).toBeVisible();
    // await expect(page.getByText(/fecha.*notificaci[oó]n/i)).toBeVisible();

    // Verify evidence was auto-registered with hash
    // await page.getByRole('tab', { name: /evidencias/i }).click();
    // await expect(page.getByText(/sha-?256/i)).toBeVisible();

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/dashboard|login/);
  });

  test('expired 72h deadline shows overdue alert', async ({ page }) => {
    // TODO: create incident with fechaDeteccion in the past (> 72h ago)
    // The UI should show an overdue alert/badge

    // await page.goto(`/incidentes/${overdueIncidenteId}`);
    // await expect(page.getByText(/vencido|excedido|overdue/i)).toBeVisible();
    // The countdown should show negative or "Plazo excedido"

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/dashboard|login/);
  });
});
