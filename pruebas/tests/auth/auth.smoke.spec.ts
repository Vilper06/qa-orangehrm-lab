import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { ADMIN_USER, ADMIN_PASS } from '../../fixtures/auth';

test.describe('Smoke - Auth', () => {
  test('login valido', async ({ page }) => {
    const l = new LoginPage(page); await l.goto(); await l.login(ADMIN_USER, ADMIN_PASS);
    await expect(page).toHaveURL(/dashboard\/index/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });
  test('login invalido', async ({ page }) => {
    const l = new LoginPage(page); await l.goto(); await l.login(ADMIN_USER, 'ContrasenaIncorrecta2026!');
    await expect(page.getByText('Invalid credentials')).toBeVisible();
    await expect(page).toHaveURL(/auth\/login/);
  });
});
