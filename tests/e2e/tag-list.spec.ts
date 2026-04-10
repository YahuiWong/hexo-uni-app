import { test, expect } from '@playwright/test';

/**
 * 标签列表功能测试
 * 测试标签列表页面和标签文章列表
 */
test.describe('Tag List Tests', () => {
  test('应该能够访问标签列表页面', async ({ page }) => {
    await page.goto('/pages/tag/list');

    // 检查容器
    const container = page.locator('.container');
    await expect(container).toBeVisible({ timeout: 10000 });
  });

  test('标签列表应该显示多个标签', async ({ page }) => {
    await page.goto('/pages/tag/list');

    const tagItems = page.locator('.tag-item');
    const count = await tagItems.count();

    // 至少应该有 1 个标签
    expect(count).toBeGreaterThan(0);
  });

  test('标签应该显示名称和文章数量', async ({ page }) => {
    await page.goto('/pages/tag/list');

    const tagItems = page.locator('.tag-item');

    if (await tagItems.count() > 0) {
      const firstTag = tagItems.first();
      await expect(firstTag).toBeVisible();

      // 检查标签名称
      const tagName = firstTag.locator('.tag-name');
      await expect(tagName).toBeVisible();

      // 检查文章数量
      const postCount = firstTag.locator('.tag-count');
      await expect(postCount).toBeVisible();
    }
  });

  test('应该能够点击标签进入文章列表', async ({ page }) => {
    await page.goto('/pages/tag/list');

    const tagItems = page.locator('.tag-item');

    if (await tagItems.count() > 0) {
      // 点击第一个标签
      await tagItems.first().click();

      // 等待文章列表页面加载
      await expect(page.locator('.container')).toBeVisible({ timeout: 10000 });
    }
  });
});
