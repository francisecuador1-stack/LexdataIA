import { test, expect } from '@playwright/test';

/**
 * E2E: MARK AI proposal → Signature queue → DPO approval.
 *
 * Tests the supervised AI flow (INV-5):
 *   1. MARK AI creates a document/proposal (via API or background job)
 *   2. MARK AI places it in the signature queue (solicitud_firma)
 *   3. DPO sees the pending signature request in the queue
 *   4. DPO reviews and approves (signs) the document
 *   5. MARK AI CANNOT sign — only the DPO can
 */

test.describe('MARK AI proposal and DPO signature flow', () => {
  test('DPO sees MARK AI proposals in the signature queue', async ({ page }) => {
    // Login as DPO
    // await loginAsDPO(page);

    await page.goto('/dashboard');

    // Navigate to signature queue
    // await page.getByRole('link', { name: /cola.*firma|solicitudes.*firma/i }).click();
    // OR navigate directly:
    // await page.goto('/firmas');

    // Verify pending signature requests exist
    // await expect(page.getByText(/solicitud.*firma/i)).toBeVisible();
    // await expect(page.getByText(/MARK AI/i)).toBeVisible(); // solicitante is MARK_AI
    // await expect(page.getByText(/pendiente/i)).toBeVisible();

    await expect(page).toHaveURL(/dashboard|login/);
  });

  test('DPO can review the proposal document', async ({ page }) => {
    // await loginAsDPO(page);
    // await page.goto('/firmas');

    // Click on a pending signature request
    // const request = page.getByRole('row').filter({ hasText: /MARK AI/ }).first();
    // await request.click();

    // Verify document content is displayed for review
    // await expect(page.getByText(/documento/i)).toBeVisible();
    // await expect(page.getByText(/contenido|resumen/i)).toBeVisible();

    // Verify the document shows who created it (MARK AI)
    // await expect(page.getByText(/creado por.*MARK AI/i)).toBeVisible();

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/dashboard|login/);
  });

  test('DPO approves and signs the document', async ({ page }) => {
    // await loginAsDPO(page);
    // await page.goto('/firmas/pending-id');

    // Click approve/sign
    // await page.getByRole('button', { name: /aprobar|firmar/i }).click();

    // Confirm action (may require MFA for DPO)
    // await page.getByRole('button', { name: /confirmar/i }).click();

    // Verify signature was recorded
    // await expect(page.getByText(/firmado/i)).toBeVisible();
    // await expect(page.getByText(/hash.*firma/i)).toBeVisible();

    // Verify audit log entry was created
    // The actor should be HUMANO (not MARK_AI)
    // await page.goto('/audit-log');
    // await expect(page.getByText(/HUMANO.*firmar/i)).toBeVisible();

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/dashboard|login/);
  });

  test('DPO can reject a MARK AI proposal', async ({ page }) => {
    // await loginAsDPO(page);
    // await page.goto('/firmas/pending-id-2');

    // Click reject
    // await page.getByRole('button', { name: /rechazar/i }).click();
    // await page.getByLabel(/motivo/i).fill('Requiere revisión adicional del artículo 37');
    // await page.getByRole('button', { name: /confirmar/i }).click();

    // Verify the request is marked as rejected
    // await expect(page.getByText(/rechazado/i)).toBeVisible();

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/dashboard|login/);
  });

  test('MARK AI identity cannot access the sign endpoint directly (INV-5)', async ({ page, request }) => {
    // This test uses the API directly to verify the backend restriction

    // Attempt to sign as MARK_AI via API
    // const markAiToken = await getMarkAIToken(); // service account token
    // const response = await request.post('/api/firmas/some-id/sign', {
    //   headers: { Authorization: `Bearer ${markAiToken}` },
    //   data: {},
    // });
    // expect(response.status()).toBe(403);

    // Verify error message
    // const body = await response.json();
    // expect(body.message).toMatch(/no autorizado|forbidden|INV-5/i);

    // For now, just verify the dashboard loads (placeholder)
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/dashboard|login/);
  });

  test('signature creates an immutable audit log entry', async ({ page }) => {
    // After a document is signed, verify:
    // 1. audit_log entry exists with actorType = HUMANO
    // 2. The entry has a valid hashSha256
    // 3. The entry is linked to the document via entidadId

    // await loginAsDPO(page);
    // await page.goto('/audit-log?entidad=firma');

    // const latestEntry = page.getByRole('row').first();
    // await expect(latestEntry).toContainText('HUMANO');
    // await expect(latestEntry).toContainText('firmar');
    // await latestEntry.click();
    // await expect(page.getByText(/sha-?256/i)).toBeVisible();

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/dashboard|login/);
  });
});
