// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * =====================================================
 * PLAYWRIGHT CONFIGURATION FOR JOBTRACK4U E2E TESTS
 * =====================================================
 *
 * This configuration file sets up Playwright for comprehensive end-to-end
 * testing of the JobTrack4U application. It includes settings for:
 * - Different browsers and devices
 * - Test environment configuration
 * - Reporting and output options
 * - Base URL and timeout settings
 * - Global setup and teardown
 */

module.exports = defineConfig({
  // Test directory containing all test files
  testDir: './tests',

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use. See https://playwright.dev/docs/test-reporters
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['list']
  ],

  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: 'http://localhost:3000',

    // Global test timeout
    actionTimeout: 30000,
    navigationTimeout: 30000,

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Take screenshot on failure
    screenshot: 'only-on-failure',

    // Record video on failure
    video: 'retain-on-failure',

    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Test against mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },

    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    // Test against branded browsers
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
  ],

  // Run your local dev server before starting the tests
  webServer: [
    {
      command: 'npm start',
      cwd: '../JobTrack4UApp',
      port: 3000,
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
    {
      command: 'npm run server',
      cwd: '../JobTrack4UApp',
      port: 5000,
      reuseExistingServer: !process.env.CI,
      timeout: 60000,
    }
  ],

  // Global setup and teardown
  globalSetup: require.resolve('./global-setup.js'),
  globalTeardown: require.resolve('./global-teardown.js'),

  // Timeout for each test
  timeout: 60000,

  // Expect timeout for assertions
  expect: {
    timeout: 10000,
  },
});
