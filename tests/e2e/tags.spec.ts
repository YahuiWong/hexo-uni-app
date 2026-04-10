import { test, expect } from '@playwright/test';

/**
 * 标签云测试
 * 测试标签云的显示和交互
 */
test.describe('Tag Cloud Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('应该能够访问标签云页面', async ({ page }) => {
    // 尝试通过导航进入标签云
    // 由于应用是小程序风格，可能需要特定的导航方式
    await page.goto('/pages/tag/cloudlist');

    // 检查标签云容器
    const tagCloud = page.locator('.tag-cloud');
    await expect(tagCloud).toBeVisible({ timeout: 10000 });
  });

  test('标签云应该显示多个标签', async ({ page }) => {
    await page.goto('/pages/tag/cloudlist');

    const tagItems = page.locator('.tag-item');
    const count = await tagItems.count();

    // 至少应该有 3 个标签
    expect(count).toBeGreaterThan(2);
  });

  test('标签云应该显示标签名称和数量', async ({ page }) => {
    await page.goto('/pages/tag/cloudlist');

    const tagItems = page.locator('.tag-item');

    if (await tagItems.count() > 0) {
      // 检查第一个标签项
      const firstTag = tagItems.first();
      await expect(firstTag).toBeVisible();

      // 检查标签名称
      const tagName = firstTag.locator('.tag-name');
      await expect(tagName).toBeVisible();

      // 检查标签数量
      const tagCount = firstTag.locator('.tag-count');
      await expect(tagCount).toBeVisible();
    }
  });

  test('标签云应该支持触摸交互', async ({ page }) => {
    await page.goto('/pages/tag/cloudlist');

    const tagCloud = page.locator('.tag-cloud');
    await expect(tagCloud).toBeVisible({ timeout: 10000 });

    // 模拟触摸开始
    await tagCloud.dispatchEvent('touchstart');

    // 应该能够触摸移动
    await tagCloud.dispatchEvent('touchmove');
  });
});
