import { defineConfig } from '@playwright/test';

/**
 * Playwright 电子级测试配置
 *
 * 运行命令：
 *   pnpm test:e2e           # 运行所有测试
 *   pnpm test:e2e --ui      # 使用 UI 模式运行
 *   pnpm test:e2e --headed  # 有界面模式运行
 *
 * 注意：需要先启动开发服务器：pnpm dev:h5
 */
export default defineConfig({
  testDir: __dirname,
  testMatch: '**/*.spec.ts',
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
    baseURL: 'http://localhost:5174',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'retain-on-failure'
  },

  projects: [
    {
      name: 'firefox',
      use: { browserName: 'firefox' }
    }
  ]

});
