import { test, expect } from '@playwright/test';

/**
 * 归档页面测试
 * 测试归档时间线的显示
 */
test.describe('Archive Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('应该能够访问归档页面', async ({ page }) => {
    await page.goto('/pages/archive/list');

    // 检查归档容器
    const archiveContainer = page.locator('.container');
    await expect(archiveContainer).toBeVisible({ timeout: 10000 });
  });

  test('归档页面应该显示年份分组', async ({ page }) => {
    await page.goto('/pages/archive/list');

    // 检查年份部分
    const yearSections = page.locator('.year-section');
    const count = await yearSections.count();

    // 至少应该有 1 个年份分组
    expect(count).toBeGreaterThan(0);
  });

  test('归档应该显示文章列表', async ({ page }) => {
    await page.goto('/pages/archive/list');

    // 等待归档数据加载
    const postDates = page.locator('.post-date');
    await expect(postDates.first()).toBeVisible({ timeout: 15000 });
  });

  test('归档页面应该支持展开/收起', async ({ page }) => {
    await page.goto('/pages/archive/list');

    // 获取第一个年份标题
    const yearHeader = page.locator('.year-header').first();
    await expect(yearHeader).toBeVisible();

    // 点击展开
    await yearHeader.click();

    // 检查月份内容是否显示
    const monthsWrapper = page.locator('.months-wrapper').first();
    await expect(monthsWrapper).toBeVisible();
  });
});
