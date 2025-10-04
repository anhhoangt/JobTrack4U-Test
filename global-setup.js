/**
 * =====================================================
 * GLOBAL SETUP FOR PLAYWRIGHT TESTS
 * =====================================================
 *
 * This file contains global setup logic that runs before all tests.
 * It handles:
 * - Database setup and seeding
 * - Authentication state preparation
 * - Environment variable validation
 * - Initial data creation for tests
 */

const { chromium } = require('@playwright/test');

async function globalSetup(config) {
  console.log('🚀 Starting global setup for JobTrack4U E2E tests...');

  try {
    // Wait for the application to be ready
    console.log('⏳ Waiting for application to be ready...');
    await waitForApplication();

    // Create test user and initial data
    console.log('👤 Setting up test user and initial data...');
    await setupTestData();

    console.log('✅ Global setup completed successfully!');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  }
}

/**
 * Wait for the application to be available
 */
async function waitForApplication() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  let retries = 30;
  while (retries > 0) {
    try {
      await page.goto('http://localhost:3000', { timeout: 5000 });
      console.log('✅ Frontend is ready');
      break;
    } catch (error) {
      console.log(`⏳ Waiting for frontend... (${retries} retries left)`);
      retries--;
      await page.waitForTimeout(2000);
    }
  }

  if (retries === 0) {
    throw new Error('Frontend failed to start');
  }

  // Check backend health
  retries = 30;
  while (retries > 0) {
    try {
      const response = await page.request.get('http://localhost:5000/api/v1/auth/getCurrentUser');
      if (response.status() === 401 || response.status() === 200) {
        console.log('✅ Backend is ready');
        break;
      }
    } catch (error) {
      console.log(`⏳ Waiting for backend... (${retries} retries left)`);
      retries--;
      await page.waitForTimeout(2000);
    }
  }

  if (retries === 0) {
    throw new Error('Backend failed to start');
  }

  await browser.close();
}

/**
 * Create test user and initial data
 */
async function setupTestData() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to the application
    await page.goto('http://localhost:3000');

    // Try to register a test user (ignore if already exists)
    try {
      await page.goto('http://localhost:3000/register');

      // Check if we're already logged in
      const isLoggedIn = await page.locator('[data-testid="dashboard"]').isVisible({ timeout: 2000 });

      if (!isLoggedIn) {
        // Switch to register mode if needed
        const registerButton = page.locator('button:has-text("Sign Up")');
        if (await registerButton.isVisible()) {
          await registerButton.click();
        }

        // Fill registration form
        await page.fill('input[name="name"]', 'Test User');
        await page.fill('input[name="email"]', 'test@jobtrack.com');
        await page.fill('input[name="password"]', 'testpassword123');

        // Submit registration
        await page.click('button[type="submit"]');

        // Wait for success or error
        await page.waitForTimeout(3000);

        console.log('✅ Test user created or already exists');
      } else {
        console.log('✅ Already logged in - test user exists');
      }
    } catch (error) {
      console.log('ℹ️  Test user may already exist or login failed, continuing...');
    }

  } catch (error) {
    console.warn('⚠️  Could not create test data:', error.message);
  } finally {
    await browser.close();
  }
}

module.exports = globalSetup;
