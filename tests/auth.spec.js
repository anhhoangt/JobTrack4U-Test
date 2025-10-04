/**
 * =====================================================
 * AUTHENTICATION TESTS
 * =====================================================
 *
 * This test suite covers all authentication-related functionality:
 * - User registration
 * - User login
 * - Logout functionality
 * - Authentication state persistence
 * - Redirect behavior for protected routes
 */

const { test, expect } = require('@playwright/test');

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Start fresh for each test
    await page.context().clearCookies();
    await page.goto('/');
  });

  test('should redirect unauthenticated users to register page', async ({ page }) => {
    // Visiting the root should redirect to register if not authenticated
    await expect(page).toHaveURL('/register');

    // Should show the register/login form
    await expect(page.locator('h3')).toContainText(['Login', 'Register']);
  });

  test('should register a new user successfully', async ({ page }) => {
    await page.goto('/register');

    // Switch to register mode if needed
    const registerButton = page.locator('button:has-text("Sign Up")');
    if (await registerButton.isVisible()) {
      await registerButton.click();
    }

    // Generate unique email for this test
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@jobtrack.com`;

    // Fill registration form
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'testpassword123');

    // Submit registration
    await page.click('button[type="submit"]');

    // Should redirect to dashboard after successful registration
    await expect(page).toHaveURL('/', { timeout: 10000 });

    // Should show dashboard content
    await expect(page.locator('h1, h2, h3')).toContainText(['Stats', 'Dashboard', 'Welcome']);
  });

  test('should login existing user successfully', async ({ page }) => {
    await page.goto('/register');

    // Make sure we're in login mode
    const loginButton = page.locator('button:has-text("Sign In")');
    if (await loginButton.isVisible()) {
      await loginButton.click();
    }

    // Fill login form with test credentials
    await page.fill('input[name="email"]', 'test@jobtrack.com');
    await page.fill('input[name="password"]', 'testpassword123');

    // Submit login
    await page.click('button[type="submit"]');

    // Should redirect to dashboard after successful login
    await expect(page).toHaveURL('/', { timeout: 10000 });

    // Should show user-specific content
    await expect(page.locator('[data-testid="user-info"], .navbar')).toBeVisible();
  });

  test('should show error for invalid login credentials', async ({ page }) => {
    await page.goto('/register');

    // Make sure we're in login mode
    const loginButton = page.locator('button:has-text("Sign In")');
    if (await loginButton.isVisible()) {
      await loginButton.click();
    }

    // Fill form with invalid credentials
    await page.fill('input[name="email"]', 'invalid@email.com');
    await page.fill('input[name="password"]', 'wrongpassword');

    // Submit login
    await page.click('button[type="submit"]');

    // Should stay on the same page and show error
    await expect(page).toHaveURL('/register');

    // Should show error message
    await expect(page.locator('[class*="alert"], .error, [role="alert"]')).toBeVisible({ timeout: 5000 });
  });

  test('should toggle between login and register modes', async ({ page }) => {
    await page.goto('/register');

    // Should initially show login form
    await expect(page.locator('h3')).toContainText(['Login', 'Sign In', 'Welcome Back']);

    // Click to switch to register mode
    await page.click('button:has-text("Sign Up")');

    // Should now show register form
    await expect(page.locator('h3')).toContainText(['Register', 'Join Us', 'Sign Up']);

    // Should show name field in register mode
    await expect(page.locator('input[name="name"]')).toBeVisible();

    // Click to switch back to login mode
    await page.click('button:has-text("Sign In")');

    // Should show login form again
    await expect(page.locator('h3')).toContainText(['Login', 'Sign In', 'Welcome Back']);

    // Name field should be hidden in login mode
    await expect(page.locator('input[name="name"]')).not.toBeVisible();
  });

  test('should logout user successfully', async ({ page }) => {
    // First login
    await page.goto('/register');
    await page.fill('input[name="email"]', 'test@jobtrack.com');
    await page.fill('input[name="password"]', 'testpassword123');
    await page.click('button[type="submit"]');

    // Wait for dashboard to load
    await expect(page).toHaveURL('/');

    // Find and click logout button (could be in dropdown or direct button)
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign Out"), [data-testid="logout-button"]');

    // Try to find logout in navigation dropdown if not directly visible
    if (!(await logoutButton.isVisible())) {
      const userMenu = page.locator('[data-testid="user-menu"], .user-dropdown, .nav-user');
      if (await userMenu.isVisible()) {
        await userMenu.click();
      }
    }

    await logoutButton.click();

    // Should redirect to register page after logout
    await expect(page).toHaveURL('/register', { timeout: 10000 });

    // Should show login/register form
    await expect(page.locator('h3')).toContainText(['Login', 'Register']);
  });

  test('should maintain authentication state across page refreshes', async ({ page }) => {
    // Login first
    await page.goto('/register');
    await page.fill('input[name="email"]', 'test@jobtrack.com');
    await page.fill('input[name="password"]', 'testpassword123');
    await page.click('button[type="submit"]');

    // Wait for dashboard
    await expect(page).toHaveURL('/');

    // Refresh the page
    await page.reload();

    // Should still be authenticated and on dashboard
    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-testid="dashboard"], .dashboard, h1, h2')).toBeVisible();
  });

  test('should validate required fields in registration', async ({ page }) => {
    await page.goto('/register');

    // Switch to register mode
    const registerButton = page.locator('button:has-text("Sign Up")');
    if (await registerButton.isVisible()) {
      await registerButton.click();
    }

    // Try to submit without filling required fields
    await page.click('button[type="submit"]');

    // Should show error message for missing fields
    await expect(page.locator('[class*="alert"], .error, [role="alert"]')).toBeVisible({ timeout: 5000 });

    // Should stay on register page
    await expect(page).toHaveURL('/register');
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/register');

    // Switch to register mode
    const registerButton = page.locator('button:has-text("Sign Up")');
    if (await registerButton.isVisible()) {
      await registerButton.click();
    }

    // Fill form with invalid email
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', 'password123');

    // Submit form
    await page.click('button[type="submit"]');

    // Should show validation error for invalid email
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toHaveAttribute('type', 'email');

    // Browser should show validation message for invalid email
    const validationMessage = await emailInput.evaluate(el => el.validationMessage);
    expect(validationMessage).toBeTruthy();
  });
});
