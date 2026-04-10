import { test, expect } from '@playwright/test';

/**
 * 分类功能测试
 * 测试分类列表和分类文章列表
 */
test.describe('Category Tests', () => {
  test('应该能够访问分类列表页面', async ({ page }) => {
    await page.goto('/pages/category/list');

    // 检查分类容器
    const container = page.locator('.container');
    await expect(container).toBeVisible({ timeout: 10000 });
  });

  test('分类列表应该显示多个分类', async ({ page }) => {
    await page.goto('/pages/category/list');

    const categoryItems = page.locator('.category-item');
    const count = await categoryItems.count();

    // 至少应该有 1 个分类
    expect(count).toBeGreaterThan(0);
  });

  test('分类应该显示名称和文章数量', async ({ page }) => {
    await page.goto('/pages/category/list');

    const categoryItems = page.locator('.category-item');

    if (await categoryItems.count() > 0) {
      const firstCategory = categoryItems.first();
      await expect(firstCategory).toBeVisible();

      // 检查分类名称
      const categoryName = firstCategory.locator('.category-name');
      await expect(categoryName).toBeVisible();

      // 检查文章数量
      const postCount = firstCategory.locator('.post-count');
      await expect(postCount).toBeVisible();
    }
  });

  test('应该能够点击分类进入文章列表', async ({ page }) => {
    await page.goto('/pages/category/list');

    const categoryItems = page.locator('.category-item');

    if (await categoryItems.count() > 0) {
      // 点击第一个分类
      await categoryItems.first().click();

      // 等待文章列表页面加载
      await expect(page.locator('.posts-container')).toBeVisible({ timeout: 10000 });
    }
  });
});
