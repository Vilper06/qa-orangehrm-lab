import { test, expect } from '../../fixtures/base';
import { SEEDPASS } from '../../lib/config';
import { loginOk, goto } from '../../lib/ui';

test.describe('Control de acceso (RF-08 CP-32, RF-10 CP-36)', () => {
  test('CP-32 ESS sin subordinados no aprueba', async ({ page, ev }) => {
    await loginOk(page, 'carlos.ramirez', SEEDPASS);
    const opciones = await page.locator('.oxd-topbar-body-nav-tab').allInnerTexts();
    await page.getByRole('link', { name: 'Leave' }).click();
    await page.waitForLoadState('networkidle');
    const tabs = (await page.locator('.oxd-topbar-body-nav-tab').allInnerTexts()).map(s => s.trim());
    const hayLeaveList = tabs.some(t => /Leave List/i.test(t));
    await page.goto('/web/index.php/leave/viewLeaveList');
    await page.waitForLoadState('networkidle');
    const cuerpo = (await page.locator('.oxd-layout-context, body').first().innerText()).replace(/\s+/g, ' ');
    const hayAprobar = await page.getByRole('button', { name: /Approve|Reject/ }).count();
    ev.obtenido = `Opciones del menu Leave: ${tabs.join(' | ')}; URL Leave List: ${page.url()}; texto: ${cuerpo.slice(0, 120)}`;
    expect(hayLeaveList).toBeFalsy();
    expect(hayAprobar).toBe(0);
    expect(cuerpo).not.toMatch(/Leave List\s+From Date/);
  });

  test('CP-36 ESS no accede a Admin', async ({ page, ev }) => {
    await loginOk(page, 'carlos.ramirez', SEEDPASS);
    const menu = (await page.locator('.oxd-main-menu-item').allInnerTexts()).map(s => s.trim());
    await page.goto('/web/index.php/admin/viewSystemUsers');
    await page.waitForLoadState('networkidle');
    const cuerpo = (await page.locator('.oxd-layout-context, body').first().innerText()).replace(/\s+/g, ' ');
    ev.obtenido = `Menu: ${menu.join(' | ')}; URL final: ${page.url()}; texto: ${cuerpo.slice(0, 120)}`;
    expect(menu).not.toContain('Admin');
    await expect(page.getByText('System Users')).toHaveCount(0);
    await expect(page.locator('.oxd-table')).toHaveCount(0);
  });
});
