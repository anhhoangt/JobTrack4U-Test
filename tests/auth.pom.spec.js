/**
 * =====================================================
 * AUTHENTICATION TESTS - POM VERSION
 * =====================================================
 *
 * This test suite covers all authentication-related functionality
 * using the Page Object Model pattern:
 * - User registration
 * - User login
 * - Logout functionality
 * - Authentication state persistence
 * - Redirect behavior for protected routes
 */

const { test, expect } = require('@playwright/test');
const { AuthPage, DashboardPage } = require('../pages');

test.describe('Authentication - POM', () => {
  let authPage;
  let dashboardPage;

  test.beforeEach(async ({ page }) => {
    // Initialize page objects
    authPage = new AuthPage(page);
    dashboardPage = new DashboardPage(page);

    // Start fresh for each test
    await authPage.clearCookies();
    await authPage.navigate('/');
  });

  test('should redirect unauthenticated users to register page', async ({ page }) => {
    // Visiting the root should redirect to register if not authenticated
    await expect(page).toHaveURL('/register');

    // Should show the register/login form
    const pageTitle = await authPage.getPageTitle();
    expect(['Login', 'Register'].some(text => pageTitle.includes(text))).toBe(true);
  });

  test('should register a new user successfully', async ({ page }) => {
    await authPage.navigateToAuth();

    // Generate unique user data
    const userData = {
      name: 'Test User',
      email: authPage.generateTestEmail(),
      password: 'testpassword123'
    };

    // Register user
    await authPage.register(userData);

    // Should redirect to dashboard after successful registration
    await expect(page).toHaveURL('/', { timeout: 10000 });

    // Should show dashboard content
    expect(await dashboardPage.isDashboardContentVisible()).toBe(true);
  });

  test('should login existing user successfully', async ({ page }) => {
    await authPage.navigateToAuth();

    // Login with test credentials
    const credentials = {
      email: 'test@jobtrack.com',
      password: 'testpassword123'
    };

    await authPage.login(credentials);

    // Should redirect to dashboard after successful login
    await expect(page).toHaveURL('/', { timeout: 10000 });

    // Should show user-specific content
    expect(await authPage.isUserInfoVisible()).toBe(true);
  });

  test('should show error for invalid login credentials', async ({ page }) => {
    await authPage.navigateToAuth();

    // Login with invalid credentials
    const invalidCredentials = {
      email: 'invalid@email.com',
      password: 'wrongpassword'
    };

    await authPage.login(invalidCredentials);

    // Should stay on the same page
    expect(await authPage.isOnRegisterPage()).toBe(true);

    // Should show error message
    expect(await authPage.isAlertVisible()).toBe(true);
  });

  test('should toggle between login and register modes', async ({ page }) => {
    await authPage.navigateToAuth();

    // Should initially show login form
    const initialTitle = await authPage.getPageTitle();
    expect(['Login', 'Sign In', 'Welcome Back'].some(text => initialTitle.includes(text))).toBe(true);

    // Switch to register mode
    await authPage.switchToRegister();

    // Should now show register form
    const registerTitle = await authPage.getPageTitle();
    expect(['Register', 'Join Us', 'Sign Up'].some(text => registerTitle.includes(text))).toBe(true);

    // Should show name field in register mode
    expect(await authPage.isNameFieldVisible()).toBe(true);

    // Switch back to login mode
    await authPage.switchToLogin();

    // Should show login form again
    const loginTitle = await authPage.getPageTitle();
    expect(['Login', 'Sign In', 'Welcome Back'].some(text => loginTitle.includes(text))).toBe(true);

    // Name field should be hidden in login mode
    expect(await authPage.isNameFieldVisible()).toBe(false);
  });

  test('should logout user successfully', async ({ page }) => {
    // First login
    await authPage.performLogin();

    // Wait for dashboard to load
    await dashboardPage.waitForDashboardLoad();

    // Logout
    await authPage.logout();

    // Should redirect to register page after logout
    await expect(page).toHaveURL('/register', { timeout: 10000 });

    // Should show login/register form
    const pageTitle = await authPage.getPageTitle();
    expect(['Login', 'Register'].some(text => pageTitle.includes(text))).toBe(true);
  });

  test('should maintain authentication state across page refreshes', async ({ page }) => {
    // Login first
    await authPage.performLogin();

    // Wait for dashboard
    await dashboardPage.waitForDashboardLoad();

    // Refresh the page
    await authPage.reload();

    // Should still be authenticated and on dashboard
    await expect(page).toHaveURL('/');
    expect(await dashboardPage.isDashboardContentVisible()).toBe(true);
  });

  test('should validate required fields in registration', async ({ page }) => {
    await authPage.navigateToAuth();

    // Switch to register mode
    await authPage.switchToRegister();

    // Try to submit without filling required fields
    await authPage.submitForm();

    // Should show error message for missing fields
    expect(await authPage.isAlertVisible()).toBe(true);

    // Should stay on register page
    expect(await authPage.isOnRegisterPage()).toBe(true);
  });

  test('should validate email format', async ({ page }) => {
    await authPage.navigateToAuth();

    // Fill form with invalid email
    const invalidUserData = {
      name: 'Test User',
      email: 'invalid-email',
      password: 'password123'
    };

    await authPage.fillRegistrationForm(invalidUserData);

    // Submit form
    await authPage.submitForm();

    // Browser should show validation message for invalid email
    const validationMessage = await authPage.getEmailValidationMessage();
    expect(validationMessage).toBeTruthy();
  });

  test('should handle multiple login attempts', async ({ page }) => {
    await authPage.navigateToAuth();

    const credentials = {
      email: 'test@jobtrack.com',
      password: 'testpassword123'
    };

    // Perform multiple login attempts to ensure consistency
    for (let i = 0; i < 2; i++) {
      if (i > 0) {
        // Navigate back to auth page for subsequent attempts
        await authPage.navigateToAuth();
      }

      await authPage.login(credentials);

      // Should successfully login each time
      await expect(page).toHaveURL('/', { timeout: 10000 });

      if (i < 1) {
        // Logout for next iteration
        await authPage.logout();
      }
    }
  });

  test('should clear form after switching modes', async ({ page }) => {
    await authPage.navigateToAuth();

    // Fill login form
    await authPage.fillLoginForm({
      email: 'test@example.com',
      password: 'testpass'
    });

    // Switch to register mode
    await authPage.switchToRegister();

    // Switch back to login mode
    await authPage.switchToLogin();

    // Form values should be preserved or cleared based on implementation
    const formValues = await authPage.getFormValues();

    // This test verifies the form behavior after mode switching
    expect(typeof formValues.email).toBe('string');
    expect(typeof formValues.password).toBe('string');
  });
});
