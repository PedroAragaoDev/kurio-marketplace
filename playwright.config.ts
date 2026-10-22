import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e', fullyParallel: true, timeout: 45000,
  expect: { timeout: 10000, toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled' } },
  retries: 0, reporter: [['list'], ['html', { open: 'never' }], ['json', { outputFile: 'test-results/report.json' }]],
  use: { baseURL: 'http://127.0.0.1:4182', trace: 'retain-on-failure', screenshot: 'only-on-failure', serviceWorkers: 'allow' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { ...devices['iPhone 13'], browserName: 'chromium', viewport: { width: 390, height: 844 } } },
  ],
  webServer: { command: 'npm run build && npm run preview -- --port 4182 --strictPort', url: 'http://127.0.0.1:4182', reuseExistingServer: !process.env.CI, timeout: 120000 },
})
