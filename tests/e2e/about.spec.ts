import { test, expect } from '@playwright/test';

/**
 * 关于页面测试
 */
test.describe('About Tests', () => {
  test('应该能够访问关于页面', async ({ page }) => {
    await page.goto('/pages/about/index');

    // 检查容器
    const container = page.locator('.container');
    await expect(container).toBeVisible({ timeout: 10000 });
  });

  test('关于页面应该显示站点信息', async ({ page }) => {
    await page.goto('/pages/about/index');

    // 检查站点标题
    const siteTitle = page.locator('.site-title');
    await expect(siteTitle).toBeVisible({ timeout: 10000 });
  });

  test('关于页面应该显示作者信息', async ({ page }) => {
    await page.goto('/pages/about/index');

    // 检查作者信息卡片
    const authorCard = page.locator('.info-card');
    await expect(authorCard.first()).toBeVisible({ timeout: 10000 });
  });

  test('关于页面应该显示统计信息', async ({ page }) => {
    await page.goto('/pages/about/index');

    // 检查统计信息
    const stats = page.locator('.stat-item');
    const count = await stats.count();

    // 至少应该有 1 个统计项
    expect(count).toBeGreaterThan(0);
  });
});
