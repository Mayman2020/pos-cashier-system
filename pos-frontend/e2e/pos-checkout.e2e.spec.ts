import { expect, test, Page } from '@playwright/test';

const E2E = !!process.env['E2E_ENABLED'];
const CASHIER = { username: 'cashier', password: 'admin123' };

async function login(page: Page): Promise<void> {
  await page.goto('/auth/login');
  await page.locator('input[formcontrolname="username"]').fill(CASHIER.username);
  await page.locator('input[formcontrolname="password"]').fill(CASHIER.password);
  await page.getByRole('button', { name: /sign in|login|تسجيل الدخول/i }).click();
  await page.waitForURL(/\/admin\//);
}

test.describe('POS Checkout Flow', () => {
  test('cashier opens shift, sells product, and closes shift', async ({ page }) => {
    test.skip(!E2E, 'Set E2E_ENABLED=true with backend + frontend running');

    await login(page);
    await page.goto('/admin/pos');
    await expect(page).toHaveURL(/\/admin\/pos/);

    const shiftBanner = page.locator('.shift-banner');
    if (await shiftBanner.isVisible()) {
      await page.locator('.shift-open-row input').fill('200');
      await page.getByRole('button', { name: /open shift|فتح/i }).click();
      await expect(shiftBanner).toBeHidden({ timeout: 10000 });
    }

    await expect(page.locator('.pos-shift-bar')).toBeVisible({ timeout: 10000 });

    const productCard = page.locator('.pos-product-card').first();
    await expect(productCard).toBeVisible();
    await productCard.click();

    await expect(page.locator('.cart-line').first()).toBeVisible({ timeout: 5000 });

    await page.getByRole('button', { name: /checkout|إتمام الدفع/i }).first().click();
    await expect(page.locator('.checkout-overlay')).toBeVisible();
    await page.getByRole('button', { name: /confirm payment|تأكيد الدفع/i }).click();

    await expect(page.locator('.checkout-overlay')).toBeHidden({ timeout: 15000 });

    await page.goto('/admin/shifts');
    await expect(page.locator('app-shift-list')).toBeVisible();

    const closeBtn = page.getByRole('button', { name: /close shift|إغلاق/i }).first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await expect(page.locator('app-close-shift-dialog')).toBeVisible();
      await page.getByRole('button', { name: /confirm close|تأكيد الإغلاق/i }).click();
    }
  });

  test('cashier can view orders list', async ({ page }) => {
    test.skip(!E2E, 'Set E2E_ENABLED=true with backend + frontend running');
    await login(page);
    await page.goto('/admin/orders');
    await expect(page.locator('app-order-list')).toBeVisible();
  });
});
