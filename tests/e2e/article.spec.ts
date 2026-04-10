import { test, expect } from '@playwright/test';

/**
 * 文章详情页测试
 * 测试文章详情页的加载、内容显示等
 */
test.describe('Article Detail Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('应该能够点击文章进入详情页', async ({ page }) => {
    // 等待文章列表加载
    const postItems = page.locator('.post-item');
    await expect(postItems.first()).toBeVisible({ timeout: 15000 });

    // 获取第一篇文章的标题
    const firstPostTitle = await postItems.first().locator('.title').innerText();

    // 点击文章
    await postItems.first().click();

    // 等待详情页加载
    await expect(page.locator('.detail-container')).toBeVisible({ timeout: 10000 });

    // 检查详情页包含文章标题
    const detailTitle = page.locator('.title');
    await expect(detailTitle).toBeVisible();

    const titleText = await detailTitle.innerText();
    expect(titleText).toContain(firstPostTitle.substring(0, 5));
  });

  test('详情页应该显示文章内容', async ({ page }) => {
    // 进入详情页
    const postItems = page.locator('.post-item');
    await postItems.first().click();
    await expect(page.locator('.detail-container')).toBeVisible({ timeout: 10000 });

    // 检查内容区域
    const content = page.locator('.article-content');
    await expect(content).toBeVisible({ timeout: 10000 });
  });

  test('详情页应该显示作者和日期信息', async ({ page }) => {
    // 进入详情页
    const postItems = page.locator('.post-item');
    await postItems.first().click();
    await expect(page.locator('.detail-container')).toBeVisible({ timeout: 10000 });

    // 检查元信息
    const metaInfo = page.locator('.meta-info');
    await expect(metaInfo).toBeVisible();

    // 检查日期信息
    const dateInfo = page.locator('.date-info');
    await expect(dateInfo).toBeVisible();
  });
});
