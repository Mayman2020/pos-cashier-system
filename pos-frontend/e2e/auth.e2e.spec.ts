import { expect, test, Page } from '@playwright/test';

const E2E = !!process.env['E2E_ENABLED'];
const ADMIN = { username: 'admin', password: 'admin123' };

async function login(page: Page): Promise<void> {
  await page.goto('/auth/login');
  await page.locator('input[formcontrolname="username"]').fill(ADMIN.username);
  await page.locator('input[formcontrolname="password"]').fill(ADMIN.password);
  await page.getByRole('button', { name: /sign in|login|تسجيل الدخول/i }).click();
  await page.waitForURL(/\/admin\//);
}

test.describe('POS Authentication', () => {
  test('admin login redirects to admin area', async ({ page }) => {
    test.skip(!E2E, 'Set E2E_ENABLED=true with backend + frontend running');
    await login(page);
    await expect(page.locator('app-sidebar')).toBeVisible();
  });

  test('unauthenticated admin route redirects to login', async ({ page }) => {
    test.skip(!E2E, 'Set E2E_ENABLED=true with backend + frontend running');
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('admin can open taxes page', async ({ page }) => {
    test.skip(!E2E, 'Set E2E_ENABLED=true with backend + frontend running');
    await login(page);
    await page.goto('/admin/taxes');
    await expect(page.locator('app-tax-list')).toBeVisible();
    await expect(page.getByRole('button', { name: /add tax|إضافة ضريبة/i })).toBeVisible();
  });

  test('admin can open kitchen display', async ({ page }) => {
    test.skip(!E2E, 'Set E2E_ENABLED=true with backend + frontend running');
    await login(page);
    await page.goto('/admin/kitchen');
    await expect(page.locator('app-kitchen-display')).toBeVisible();
  });
});
