import { defineConfig } from '@playwright/test';

/**
 * Playwright 电子级测试配置
 *
 * 运行命令：
 *   pnpm test:e2e           # 运行所有测试
 *   pnpm test:e2e --ui      # 使用 UI 模式运行
 *   pnpm test:e2e --headed  # 有界面模式运行
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: true,
  retries: 2,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-result.json' }],
    ['line']
  ],
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'retain-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' }
    }
  ],

  webServer: {
    command: 'pnpm dev:h5',
    url: 'http://localhost:5173',
    reuseExistingServer: false
  }
});
