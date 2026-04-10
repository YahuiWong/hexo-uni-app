import { test, expect } from '@playwright/test';

/**
 * 分享功能测试
 */
test.describe('Share Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('详情页应该有分享按钮', async ({ page }) => {
    // 进入详情页
    const postItems = page.locator('.post-item');
    await postItems.first().click();
    await expect(page.locator('.detail-container')).toBeVisible({ timeout: 10000 });

    // 检查分享按钮
    const shareBtn = page.locator('.share-btn');
    await expect(shareBtn).toBeVisible({ timeout: 10000 });
  });

  test('应该能够打开分享面板', async ({ page }) => {
    // 进入详情页
    const postItems = page.locator('.post-item');
    await postItems.first().click();
    await expect(page.locator('.detail-container')).toBeVisible({ timeout: 10000 });

    // 点击分享按钮
    const shareBtn = page.locator('.share-btn');
    await shareBtn.click();

    // 检查分享面板
    const sharePanel = page.locator('.share-panel');
    await expect(sharePanel).toBeVisible({ timeout: 10000 });
  });

  test('分享面板应该包含微信选项', async ({ page }) => {
    // 进入详情页并打开分享面板
    const postItems = page.locator('.post-item');
    await postItems.first().click();
    await expect(page.locator('.detail-container')).toBeVisible({ timeout: 10000 });

    const shareBtn = page.locator('.share-btn');
    await shareBtn.click();

    // 检查微信分享选项
    const weixinOption = page.locator('.share-item').first();
    await expect(weixinOption).toBeVisible({ timeout: 10000 });
  });
});
