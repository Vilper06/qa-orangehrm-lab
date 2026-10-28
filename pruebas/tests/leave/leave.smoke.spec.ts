import { test, expect } from '../../fixtures/auth';
test('Smoke Leave - abrir Leave List', async ({ adminPage: page }) => {
  await page.goto('/web/index.php/leave/viewLeaveList');
  await expect(page.getByRole('heading', { name: 'Leave List' })).toBeVisible();
});
