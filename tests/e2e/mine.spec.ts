import { test, expect } from '@playwright/test';

/**
 * 我的页面测试
 */
test.describe('Mine Tests', () => {
  test('应该能够访问我的页面', async ({ page }) => {
    await page.goto('/pages/mine/index');

    // 检查容器
    const container = page.locator('.container');
    await expect(container).toBeVisible({ timeout: 10000 });
  });

  test('我的页面应该显示统计信息', async ({ page }) => {
    await page.goto('/pages/mine/index');

    // 检查统计信息区域
    const statsContainer = page.locator('.stats-container');
    await expect(statsContainer).toBeVisible({ timeout: 10000 });

    // 检查文章统计
    const postStat = page.locator('.stat-item');
    const count = await postStat.count();

    // 至少应该有 1 个统计项
    expect(count).toBeGreaterThan(0);
  });

  test('我的页面应该显示夜间模式切换', async ({ page }) => {
    await page.goto('/pages/mine/index');

    // 检查夜间模式开关
    const themeSwitch = page.locator('.theme-switch');
    await expect(themeSwitch).toBeVisible({ timeout: 10000 });
  });

  test('我的页面应该显示设置选项', async ({ page }) => {
    await page.goto('/pages/mine/index');

    // 检查设置列表
    const settings = page.locator('.setting-item');
    const count = await settings.count();

    // 至少应该有 1 个设置项
    expect(count).toBeGreaterThan(0);
  });
});
