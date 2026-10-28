import { test, expect, textoEsperado } from '../../fixtures/base';
import { LoginPage } from '../../pages/LoginPage';
import { ADMIN } from '../../lib/config';
import { msgs, loginOk, goto } from '../../lib/ui';

test.describe('Autenticacion (RF-01)', () => {
  test('CP-01 Inicio de sesion valido', async ({ page, ev }) => {
    const l = new LoginPage(page); await l.goto(); await l.login(ADMIN.user, ADMIN.pass);
    await expect(page).toHaveURL(/dashboard\/index/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    const nombre = (await page.locator('.oxd-userdropdown-name').innerText()).trim();
    ev.obtenido = `Dashboard visible; usuario mostrado: ${nombre}`;
    expect(nombre.length).toBeGreaterThan(0);
  });

  test('CP-02 Contrasena incorrecta', async ({ page, ev }) => {
    const l = new LoginPage(page); await l.goto(); await l.login('Admin', 'Incorrecta123');
    await expect(page.locator('.oxd-alert-content-text')).toBeVisible();
    const m = await msgs(page); textoEsperado(ev, m, 'Invalid credentials');
    ev.obtenido = `Mensaje: ${m.join(' / ')}; URL: ${page.url()}`;
    await expect(page).toHaveURL(/auth\/login/);
  });

  test('CP-03 Usuario inexistente', async ({ page, ev }) => {
    const l = new LoginPage(page); await l.goto(); await l.login('noexiste01', 'Prueba123');
    await expect(page.locator('.oxd-alert-content-text')).toBeVisible();
    const m = await msgs(page); textoEsperado(ev, m, 'Invalid credentials');
    ev.obtenido = `Mensaje: ${m.join(' / ')}`;
    await expect(page).toHaveURL(/auth\/login/);
  });

  test('CP-04 Campos vacios', async ({ page, ev }) => {
    const l = new LoginPage(page); await l.goto();
    await page.getByRole('button', { name: 'Login' }).click();
    const err = page.locator('.oxd-input-field-error-message');
    await expect(err).toHaveCount(2);
    const m = await msgs(page); textoEsperado(ev, m, 'Required');
    ev.obtenido = `Mensajes bajo campos: ${m.join(' / ')}`;
    for (const t of await err.allInnerTexts()) expect(t).toContain('Required');
  });

  test('CP-05 Cierre de sesion y acceso posterior', async ({ page, ev }) => {
    await loginOk(page, ADMIN.user, ADMIN.pass);
    const l = new LoginPage(page); await l.logout();
    await expect(page).toHaveURL(/auth\/login/);
    await page.goto('/web/index.php/pim/viewEmployeeList');
    await page.waitForLoadState('networkidle');
    ev.obtenido = `Tras logout, URL interna redirige a: ${page.url()}`;
    await expect(page).toHaveURL(/auth\/login/);
  });

  test('CP-06 URL interna sin sesion', async ({ page, ev }) => {
    await page.goto('/web/index.php/dashboard/index');
    await page.waitForLoadState('networkidle');
    ev.obtenido = `Redirigido a: ${page.url()}`;
    await expect(page).toHaveURL(/auth\/login/);
    await expect(page.getByPlaceholder('Username')).toBeVisible();
  });
});
