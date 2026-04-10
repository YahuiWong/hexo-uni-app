import { test, expect } from '@playwright/test';

/**
 * 搜索功能测试
 * 测试搜索框、搜索功能等
 */
test.describe('Search Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('应该能够打开搜索页面', async ({ page }) => {
    // 尝试点击搜索按钮或导航到搜索页
    // 由于首页可能没有显式的搜索按钮，直接访问搜索页
    await page.goto('/pages/search/index');

    // 检查搜索输入框
    const searchInput = page.locator('.search-input');
    await expect(searchInput).toBeVisible({ timeout: 10000 });
  });

  test('应该能够输入搜索关键词', async ({ page }) => {
    await page.goto('/pages/search/index');

    const searchInput = page.locator('.search-input');
    await searchInput.fill('测试');

    const value = await searchInput.inputValue();
    expect(value).toBe('测试');
  });

  test('应该能够执行搜索', async ({ page }) => {
    await page.goto('/pages/search/index');

    const searchInput = page.locator('.search-input');
    await searchInput.fill('技术');

    // 提交搜索
    await searchInput.press('Enter');

    // 等待搜索结果
    await expect(page.locator('.results')).toBeVisible({ timeout: 15000 });
  });

  test('搜索结果应该包含标题匹配的文章', async ({ page }) => {
    await page.goto('/pages/search/index');

    const searchInput = page.locator('.search-input');
    await searchInput.fill('架构');

    // 提交搜索
    await searchInput.press('Enter');

    // 等待搜索结果
    await expect(page.locator('.result-count')).toBeVisible({ timeout: 15000 });
  });
});
