import { test, expect } from '@playwright/test';

/**
 * 首页功能测试
 * 测试首页的加载、文章列表显示等
 */
test.describe('Homepage Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('应该正确加载首页', async ({ page }) => {
    // 等待页面加载
    await expect(page.locator('.container')).toBeVisible({ timeout: 10000 });

    // 检查页面标题
    await expect(page).toHaveTitle(/博客|Blog/);
  });

  test('应该显示文章列表', async ({ page }) => {
    // 等待文章列表项加载
    const postItems = page.locator('.post-item');
    await expect(postItems).toBeVisible({ timeout: 15000 });

    // 检查至少有一个文章项
    const count = await postItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('应该显示轮播图', async ({ page }) => {
    const swiper = page.locator('.swiper-container');
    await expect(swiper).toBeVisible({ timeout: 10000 });
  });

  test('应该显示分类和标签', async ({ page }) => {
    const categories = page.locator('.category-info');
    const tags = page.locator('.tag');

    // 检查分类或标签至少有一个
    const categoryCount = await categories.count();
    const tagCount = await tags.count();

    expect(categoryCount + tagCount).toBeGreaterThan(0);
  });
});
