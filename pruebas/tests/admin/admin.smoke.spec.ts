import { test, expect } from '../../fixtures/auth';
test('Smoke Admin - abrir Users', async ({ adminPage: page }) => {
  await page.goto('/web/index.php/admin/viewSystemUsers');
  await expect(page.getByRole('heading', { name: 'System Users' })).toBeVisible();
});
