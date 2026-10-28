import { test, expect, textoEsperado } from '../../fixtures/base';
import { ADMIN } from '../../lib/config';
import { loginOk, goto, field, fillField, pick, autocomplete, msgs, toast, businessDay, setDate } from '../../lib/ui';
import { Page } from '@playwright/test';

async function abrirAlta(page: Page) {
  await goto(page, 'recruitment/addCandidate');
  await expect(page.getByRole('heading', { name: 'Add Candidate' })).toBeVisible();
}

test.describe('Recruitment (RF-09)', () => {
  test.beforeEach(async ({ page }) => { await loginOk(page, ADMIN.user, ADMIN.pass); });

  test('CP-33 Agregar candidato a vacante', async ({ page, ev }) => {
    await abrirAlta(page);
    await page.getByPlaceholder('First Name').fill('Olga');
    await page.getByPlaceholder('Last Name').fill('Salas Rey');
    await pick(page, 'Vacancy', 'Analista QA Jr.');
    await field(page, 'Email').locator('input').fill('olga.salas@example.test');
    await page.getByRole('button', { name: 'Save' }).click();
    const t = await toast(page); textoEsperado(ev, [t], 'Successfully Saved');
    await page.waitForURL(/addCandidate\/\d+/, { timeout: 20000 });
    await page.waitForLoadState('networkidle'); await page.waitForTimeout(1000);
    const cuerpo = (await page.locator('.orangehrm-card-container, body').first().innerText()).replace(/\s+/g, ' ');
    const estado = cuerpo.match(/Status:\s*([A-Za-z ]+?)(?:\s{2,}|\s(?:Shortlist|Reject|Vacancy|Name|Email)|$)/)?.[1] ?? '';
    ev.obtenido = `Toast: ${t}; URL: ${page.url()}; texto: ${cuerpo.slice(0, 200)}`;
    expect(cuerpo).toContain('Application Initiated');
    void estado;
  });

  test('CP-34 Correo vacio e invalido', async ({ page, ev }) => {
    await abrirAlta(page);
    await page.getByPlaceholder('First Name').fill('Olga');
    await page.getByPlaceholder('Last Name').fill('Salas Rey');
    await pick(page, 'Vacancy', 'Analista QA Jr.');
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(1200);
    const vacio = await msgs(page);
    await field(page, 'Email').locator('input').fill('olga@');
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(1200);
    const invalido = await msgs(page);
    textoEsperado(ev, vacio, 'Required'); textoEsperado(ev, invalido, 'Expected format: admin@example.com');
    ev.obtenido = `Correo vacio -> ${vacio.join(' / ')}; correo "olga@" -> ${invalido.join(' / ')}; URL: ${page.url()}`;
    await expect(page).toHaveURL(/addCandidate$/);
    expect(vacio.join(' ')).toContain('Required');
    expect(invalido.join(' ')).toMatch(/format|valid|email/i);
  });

  test('CP-35 Avance de estado del candidato', async ({ page, ev }) => {
    await goto(page, 'recruitment/viewCandidates');
    await page.getByRole('button', { name: 'Search' }).click();
    await page.waitForLoadState('networkidle'); await page.waitForTimeout(1200);
    const fila = page.locator('.oxd-table-card').filter({ hasText: 'Nicolas' });
    await expect(fila.first()).toContainText('Application Initiated');
    await fila.first().locator('.oxd-table-cell-actions button').first().click();
    await page.waitForURL(/viewCandidates\/\d+|addCandidate\/\d+/, { timeout: 20000 });
    await page.waitForLoadState('networkidle'); await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Shortlist' }).click();
    await page.waitForLoadState('networkidle'); await page.waitForTimeout(800);
    await page.getByRole('button', { name: 'Save' }).click();
    const t1 = await toast(page);
    await page.waitForLoadState('networkidle'); await page.waitForTimeout(1500);
    await page.getByRole('button', { name: 'Schedule Interview' }).click();
    await page.waitForLoadState('networkidle'); await page.waitForTimeout(800);
    await fillField(page, 'Interview Title', 'Entrevista tecnica QA');
    await autocomplete(page, 'Interviewer', 'Ana Lopez', 'Ana');
    await setDate(page, 'Date', businessDay(7));
    await page.getByRole('heading').first().click();
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(2500);
    const m2 = await msgs(page);
    const t2 = (await page.locator('.oxd-toast').allInnerTexts()).map(s => s.replace(/\s+/g, ' ')).join(' / ');
    await page.waitForLoadState('networkidle'); await page.waitForTimeout(1500);
    const cuerpo = (await page.locator('.orangehrm-card-container, body').first().innerText()).replace(/\s+/g, ' ');
    ev.obtenido = `Shortlist: ${t1}; Schedule Interview: ${t2}; validaciones: ${m2.join(' / ')}; URL: ${page.url()}; texto: ${cuerpo.slice(0, 220)}`;
    await expect(page.getByText('Interview Scheduled').first()).toBeVisible({ timeout: 15000 });  });
});



