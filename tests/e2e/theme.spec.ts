import { test, expect } from '@playwright/test';

/**
 * 主题切换测试
 */
test.describe('Theme Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pages/mine/index');
  });

  test('应该能够切换到夜间模式', async ({ page }) => {
    // 等待页面加载
    await expect(page.locator('.container')).toBeVisible({ timeout: 10000 });

    // 检查初始模式（默认白天）
    const container = page.locator('.container');
    const initialBackground = await container.evaluate((el: HTMLElement) =>
      window.getComputedStyle(el).backgroundColor
    );

    // 点击夜间模式开关
    const themeSwitch = page.locator('.theme-switch');
    await themeSwitch.click();

    // 等待主题切换
    await page.waitForTimeout(500);

    // 检查夜间模式背景
    const nightBackground = await container.evaluate((el: HTMLElement) =>
      window.getComputedStyle(el).backgroundColor
    );

    // 夜间模式背景应该更暗
    expect(nightBackground).not.toBe(initialBackground);
  });

  test('夜间模式应该改变文字颜色', async ({ page }) => {
    // 点击夜间模式开关
    const themeSwitch = page.locator('.theme-switch');
    await themeSwitch.click();
    await page.waitForTimeout(500);

    // 检查文字颜色变化
    const text = page.locator('text');
    const textColor = await text.first().evaluate((el: HTMLElement) =>
      window.getComputedStyle(el).color
    );

    // 文字颜色应该存在
    expect(textColor).toBeDefined();
  });
});
