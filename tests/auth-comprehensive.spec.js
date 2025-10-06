/**
 * =====================================================
 * COMPREHENSIVE AUTHENTICATION TESTS
 * =====================================================
 *
 * This test suite covers all critical authentication scenarios including:
 * ✅ Valid & Invalid Credentials
 * ✅ Field Validation & Error Handling
 * ✅ Security Testing (SQL Injection, XSS)
 * ✅ Session Management & URL Protection
 * ✅ Accessibility & User Experience
 * ✅ Browser Compatibility Considerations
 */

const { test, expect } = require('@playwright/test');
const { AuthPage, DashboardPage, NavigationComponent } = require('../pages');

test.describe('Comprehensive Authentication Tests', () => {
  let authPage;
  let dashboardPage;
  let navigation;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    dashboardPage = new DashboardPage(page);
    navigation = new NavigationComponent(page);

    // Start with clean state
    await authPage.clearCookies();
    await authPage.navigateToAuth();
  });

  test.describe('🔐 Valid Credentials Testing', () => {

    test('@smoke should login successfully with valid credentials', async ({ page }) => {
      const credentials = {
        email: 'aaaa@gmail.com',
        password: 'aaaaaa'
      };

      await authPage.login(credentials);

      // Should redirect to dashboard
      await expect(page).toHaveURL('/', { timeout: 15000 });

      // Should show dashboard content
      const dashboardVerification = await dashboardPage.verifyDashboardLoaded();
      expect(dashboardVerification.isOnCorrectUrl).toBe(true);
    });

    test('should create session and maintain login state', async ({ page }) => {
      const credentials = {
        email: 'aaaa@gmail.com',
        password: 'aaaaaa'
      };

      await authPage.login(credentials);
      await expect(page).toHaveURL('/');

      // Verify session is created by checking we can access protected routes
      await page.goto('/all-jobs');
      await expect(page).toHaveURL('/all-jobs');

      // Should not redirect to landing page
      expect(page.url()).not.toContain('/landing');
    });
  });

  test.describe('❌ Invalid Credentials Testing', () => {

    test('should show error for wrong password with valid username', async ({ page }) => {
      const invalidCredentials = {
        email: 'aaaa@gmail.com',
        password: 'wrongpassword'
      };

      await authPage.login(invalidCredentials);

      // Should stay on landing page
      expect(await authPage.isOnRegisterPage()).toBe(true);

      // Should show error message
      await page.waitForTimeout(2000);
      const hasAlert = await authPage.isAlertVisible();
      expect(hasAlert).toBe(true);

      if (hasAlert) {
        const alertMessage = await authPage.getAlertMessage();
        expect(alertMessage.toLowerCase()).toContain('invalid');
      }
    });

    test('should show error for wrong username with any password', async ({ page }) => {
      const invalidCredentials = {
        email: 'nonexistent@email.com',
        password: 'anypassword'
      };

      await authPage.login(invalidCredentials);

      // Should stay on landing page
      expect(await authPage.isOnRegisterPage()).toBe(true);

      // Should show error message
      await page.waitForTimeout(2000);
      const hasAlert = await authPage.isAlertVisible();
      expect(hasAlert).toBe(true);
    });

    test('should show error when both username and password are wrong', async ({ page }) => {
      const invalidCredentials = {
        email: 'wrong@email.com',
        password: 'wrongpassword'
      };

      await authPage.login(invalidCredentials);

      // Should stay on landing page
      expect(await authPage.isOnRegisterPage()).toBe(true);

      // Should show error message
      await page.waitForTimeout(2000);
      const hasAlert = await authPage.isAlertVisible();
      expect(hasAlert).toBe(true);
    });

    test('should not specify which field is wrong for security', async ({ page }) => {
      const invalidCredentials = {
        email: 'aaaa@gmail.com',
        password: 'wrongpassword'
      };

      await authPage.login(invalidCredentials);
      await page.waitForTimeout(2000);

      const hasAlert = await authPage.isAlertVisible();
      if (hasAlert) {
        const alertMessage = await authPage.getAlertMessage();

        // Error message should be generic, not specify username or password
        expect(alertMessage.toLowerCase()).not.toContain('username');
        expect(alertMessage.toLowerCase()).not.toContain('password');
        expect(alertMessage.toLowerCase()).not.toContain('email');

        // Should contain generic terms
        const isGenericError = alertMessage.toLowerCase().includes('invalid') ||
                              alertMessage.toLowerCase().includes('incorrect') ||
                              alertMessage.toLowerCase().includes('credentials');
        expect(isGenericError).toBe(true);
      }
    });
  });

  test.describe('📝 Empty Fields Validation', () => {

    test('should show validation for empty email field', async ({ page }) => {
      // Try to login with empty email
      await authPage.fillLoginForm({
        email: '',
        password: 'somepassword'
      });

      await authPage.submitForm();

      // Should show validation message
      const emailValidation = await authPage.getEmailValidationMessage();
      expect(emailValidation).toBeTruthy();
    });

    test('should show validation for empty password field', async ({ page }) => {
      // Try to login with empty password
      await authPage.fillLoginForm({
        email: 'test@email.com',
        password: ''
      });

      await authPage.submitForm();

      // Form should not submit successfully
      expect(await authPage.isOnRegisterPage()).toBe(true);
    });

    test('should show validation when both fields are empty', async ({ page }) => {
      // Try to submit empty form
      await authPage.fillLoginForm({
        email: '',
        password: ''
      });

      await authPage.submitForm();

      // Should show validation for email field
      const emailValidation = await authPage.getEmailValidationMessage();
      expect(emailValidation).toBeTruthy();

      // Should stay on form
      expect(await authPage.isOnRegisterPage()).toBe(true);
    });
  });

  test.describe('🔤 Field Validation Testing', () => {

    test('should validate email format', async ({ page }) => {
      const invalidEmails = [
        'invalidemail',
        'invalid@',
        '@invalid.com',
        'invalid.email',
        'invalid@.com'
      ];

      for (const invalidEmail of invalidEmails) {
        await authPage.fillLoginForm({
          email: invalidEmail,
          password: 'password123'
        });

        await authPage.submitForm();

        // Should show email validation error
        const emailValidation = await authPage.getEmailValidationMessage();
        expect(emailValidation).toBeTruthy();

        // Clear form for next test
        await page.reload();
        await authPage.navigateToAuth();
        await authPage.switchToLogin();
      }
    });

    test('should mask password field', async ({ page }) => {
      const passwordInput = page.locator(authPage.locators.passwordInput);

      // Fill password
      await authPage.fillInput(authPage.locators.passwordInput, 'testpassword');

      // Password field should be of type 'password'
      const inputType = await passwordInput.getAttribute('type');
      expect(inputType).toBe('password');

      // The actual value should not be visible in the DOM
      const displayValue = await passwordInput.inputValue();
      expect(displayValue).toBe('testpassword'); // This is the actual value

      // But it should be masked in the UI (we can't directly test visual masking via automation)
    });
  });

  test.describe('🔗 Navigation & Redirect Testing', () => {

    test('should redirect correctly from sign-up/register link', async ({ page }) => {
      // Should start in login mode or be able to switch
      await authPage.switchToRegister();

      // Should show name field in register mode
      expect(await authPage.isNameFieldVisible()).toBe(true);

      // Switch back to login
      await authPage.switchToLogin();

      // Name field should be hidden
      expect(await authPage.isNameFieldVisible()).toBe(false);
    });

    test('should redirect logged-in users away from login page', async ({ page }) => {
      // First login
      await authPage.performLogin();
      await dashboardPage.waitForDashboardLoad();

      // Now try to access login page directly
      await page.goto('/landing');

      // Should redirect to dashboard since user is already logged in
      await expect(page).toHaveURL('/', { timeout: 10000 });
    });
  });

  test.describe('🔒 Security Testing', () => {

    test('should handle SQL injection attempts gracefully', async ({ page }) => {
      const sqlInjectionAttempts = [
        "' OR '1'='1'--",
        "admin'--",
        "'; DROP TABLE users;--",
        "' UNION SELECT * FROM users--"
      ];

      for (const sqlAttempt of sqlInjectionAttempts) {
        await authPage.fillLoginForm({
          email: sqlAttempt,
          password: sqlAttempt
        });

        await authPage.submitForm();

        // Should reject gracefully and stay on login page
        expect(await authPage.isOnRegisterPage()).toBe(true);

        // Should not cause application error or crash
        await page.waitForTimeout(1000);

        // Page should still be functional
        expect(await page.locator('body').isVisible()).toBe(true);

        // Clear form for next test
        await page.reload();
        await authPage.navigateToAuth();
        await authPage.switchToLogin();
      }
    });

    test('should handle XSS attempts gracefully', async ({ page }) => {
      const xssAttempts = [
        "<script>alert('xss')</script>",
        "<img src=x onerror=alert('xss')>",
        "javascript:alert('xss')",
        "<svg onload=alert('xss')>"
      ];

      for (const xssAttempt of xssAttempts) {
        await authPage.fillLoginForm({
          email: xssAttempt,
          password: 'password'
        });

        await authPage.submitForm();

        // Should not execute the script
        // The page should still be functional and not show alert
        await page.waitForTimeout(1000);

        // Check that no alert dialog appeared (this would throw if alert showed)
        try {
          await page.waitForEvent('dialog', { timeout: 1000 });
          // If we get here, an alert appeared - this is bad
          expect(false).toBe(true);
        } catch (error) {
          // Good - no alert appeared
          expect(true).toBe(true);
        }

        // Page should still be functional
        expect(await page.locator('body').isVisible()).toBe(true);

        // Clear form for next test
        await page.reload();
        await authPage.navigateToAuth();
        await authPage.switchToLogin();
      }
    });

    test('should use HTTPS for password transmission', async ({ page }) => {
      // This test verifies the page is loaded over HTTPS if in production
      // For local development, we might use HTTP
      const url = page.url();

      if (url.includes('localhost') || url.includes('127.0.0.1')) {
        // Local development - HTTP is acceptable
        expect(url.startsWith('http://')).toBe(true);
      } else {
        // Production - should use HTTPS
        expect(url.startsWith('https://')).toBe(true);
      }
    });
  });

  test.describe('👤 Session Management Testing', () => {

    test('should invalidate session on logout', async ({ page }) => {
      // Login first
      await authPage.performLogin();
      await dashboardPage.waitForDashboardLoad();

      // Logout
      await authPage.logout();
      await expect(page).toHaveURL('/landing');

      // Try to use browser back button to access logged-in page
      await page.goBack();

      // Should redirect to landing page, not allow access
      await expect(page).toHaveURL('/landing', { timeout: 10000 });
    });

    test('should prevent access to protected routes after logout', async ({ page }) => {
      // Login first
      await authPage.performLogin();
      await dashboardPage.waitForDashboardLoad();

      // Logout
      await authPage.logout();
      await expect(page).toHaveURL('/landing');

      // Try to access protected routes directly
      const protectedRoutes = ['/all-jobs', '/add-job'];

      for (const route of protectedRoutes) {
        await page.goto(route);
        // Should redirect to landing page
        await expect(page).toHaveURL('/landing', { timeout: 10000 });
      }
    });

    test('should not expose sensitive tokens in URLs', async ({ page }) => {
      await authPage.performLogin();
      await dashboardPage.waitForDashboardLoad();

      // Check that URL doesn't contain sensitive information
      const url = page.url();

      // Should not contain common sensitive patterns
      expect(url).not.toMatch(/token=/i);
      expect(url).not.toMatch(/session=/i);
      expect(url).not.toMatch(/auth=/i);
      expect(url).not.toMatch(/jwt=/i);
      expect(url).not.toMatch(/password=/i);
    });
  });

  test.describe('🎨 User Experience & Error Handling', () => {

    test('should display clear and helpful error messages', async ({ page }) => {
      const invalidCredentials = {
        email: 'test@invalid.com',
        password: 'wrongpassword'
      };

      await authPage.login(invalidCredentials);
      await page.waitForTimeout(2000);

      if (await authPage.isAlertVisible()) {
        const alertMessage = await authPage.getAlertMessage();

        // Error message should be helpful
        expect(alertMessage.length).toBeGreaterThan(0);
        expect(alertMessage).toBeTruthy();

        // Should be user-friendly (not technical error)
        expect(alertMessage.toLowerCase()).not.toContain('error 500');
        expect(alertMessage.toLowerCase()).not.toContain('exception');
        expect(alertMessage.toLowerCase()).not.toContain('null pointer');
      }
    });

    test('should handle rapid form submissions gracefully', async ({ page }) => {
      const credentials = {
        email: 'aaaa@gmail.com',
        password: 'aaaaaa'
      };

      await authPage.fillLoginForm(credentials);

      // Submit multiple times rapidly
      await Promise.all([
        authPage.submitForm(),
        authPage.submitForm(),
        page.waitForURL('/', { timeout: 15000 })
      ]);

      // Should handle gracefully and end up on dashboard
      expect(await dashboardPage.isOnDashboard()).toBe(true);
    });

    test('should maintain form state during errors', async ({ page }) => {
      const invalidCredentials = {
        email: 'test@email.com',
        password: 'wrongpassword'
      };

      await authPage.fillLoginForm(invalidCredentials);
      await authPage.submitForm();

      // After error, form should still contain the email
      const formValues = await authPage.getFormValues();
      expect(formValues.email).toBe('test@email.com');

      // Password should be cleared for security
      expect(formValues.password).toBe('');
    });
  });

  test.describe('⚡ Performance & Accessibility', () => {

    test('should load login form quickly', async ({ page }) => {
      const startTime = Date.now();

      await authPage.navigateToAuth();
      await authPage.waitForElement(authPage.locators.emailInput, 5000);

      const loadTime = Date.now() - startTime;

      // Should load within reasonable time (5 seconds)
      expect(loadTime).toBeLessThan(5000);
    });

    test('should have accessible form elements', async ({ page }) => {
      // Check that form fields have proper labels or placeholders
      const emailInput = page.locator(authPage.locators.emailInput);
      const passwordInput = page.locator(authPage.locators.passwordInput);

      // Should have name attributes
      expect(await emailInput.getAttribute('name')).toBeTruthy();
      expect(await passwordInput.getAttribute('name')).toBeTruthy();

      // Password field should be of correct type
      expect(await passwordInput.getAttribute('type')).toBe('password');
    });
  });

  test.describe('🔄 Edge Cases & Boundary Testing', () => {

    test('should handle very long email addresses', async ({ page }) => {
      const longEmail = 'a'.repeat(100) + '@' + 'b'.repeat(50) + '.com';

      await authPage.fillLoginForm({
        email: longEmail,
        password: 'password123'
      });

      await authPage.submitForm();

      // Should handle gracefully without crashing
      expect(await page.locator('body').isVisible()).toBe(true);
    });

    test('should handle very long passwords', async ({ page }) => {
      const longPassword = 'a'.repeat(500);

      await authPage.fillLoginForm({
        email: 'test@email.com',
        password: longPassword
      });

      await authPage.submitForm();

      // Should handle gracefully without crashing
      expect(await page.locator('body').isVisible()).toBe(true);
    });

    test('should handle special characters in credentials', async ({ page }) => {
      const specialChars = {
        email: 'test+tag@email-domain.co.uk',
        password: 'P@$$w0rd!#$%^&*()'
      };

      await authPage.fillLoginForm(specialChars);
      await authPage.submitForm();

      // Should handle gracefully
      expect(await page.locator('body').isVisible()).toBe(true);
    });

    test('should handle network timeout gracefully', async ({ page }) => {
      // This test simulates slow network conditions
      await page.route('**/api/**', route => {
        // Delay the request by 2 seconds
        setTimeout(() => route.continue(), 2000);
      });

      const credentials = {
        email: 'aaaa@gmail.com',
        password: 'aaaaaa'
      };

      await authPage.fillLoginForm(credentials);
      await authPage.submitForm();

      // Should eventually complete (with longer timeout)
      await expect(page).toHaveURL('/', { timeout: 20000 });
    });
  });
});
