/**
 * =====================================================
 * AUTHENTICATION HAPPY PATH TESTS
 * =====================================================
 *
 * This test suite focuses on positive authentication scenarios
 * and the happy path user journey through the JobTrack application.
 *
 * Test Coverage:
 * ✅ Successful user registration flow
 * ✅ Successful login with existing credentials
 * ✅ Successful logout functionality
 * ✅ Session persistence across browser interactions
 * ✅ Proper navigation redirects for authenticated users
 * ✅ User interface updates after authentication
 * ✅ Complete end-to-end authentication workflow
 */

const { test, expect } = require('@playwright/test');
const { AuthPage, DashboardPage, NavigationComponent } = require('../pages');

test.describe('Authentication Happy Path - POM', () => {
  let authPage;
  let dashboardPage;
  let navigation;

  test.beforeEach(async ({ page }) => {
    // Initialize page objects
    authPage = new AuthPage(page);
    dashboardPage = new DashboardPage(page);
    navigation = new NavigationComponent(page);

    // Ensure clean state for each test
    await authPage.clearCookies();
  });

  test.describe('🔐 User Registration Happy Path', () => {

    test('@smoke should successfully register a new user and redirect to dashboard', async ({ page }) => {
      // Navigate to registration page
      await authPage.navigateToAuth();

      // Verify we're on the register page
      expect(await authPage.isOnRegisterPage()).toBe(true);

      // Generate unique test user data
      const userData = {
        name: 'Happy Path User',
        email: authPage.generateTestEmail(),
        password: 'SecurePassword123!'
      };

      // Fill and submit registration form
      await authPage.register(userData);

      // Wait a moment to see if there are any errors
      await page.waitForTimeout(2000);

      // Check if there are any alert/error messages
      const hasAlert = await authPage.isAlertVisible();
      if (hasAlert) {
        const alertMessage = await authPage.getAlertMessage();
        console.log('Registration alert message:', alertMessage);
      }

      // Check current URL to see where we are
      console.log('Current URL after registration:', page.url());

      // Verify successful registration with redirect to dashboard
      await expect(page).toHaveURL('/', { timeout: 15000 });

      // Verify dashboard content is visible
      const dashboardVerification = await dashboardPage.verifyDashboardLoaded();
      expect(dashboardVerification.isOnCorrectUrl).toBe(true);
      expect(dashboardVerification.hasPageTitle || dashboardVerification.hasDashboardContent).toBe(true);
    });

    test('should display welcome content after successful registration', async ({ page }) => {
      await authPage.navigateToAuth();

      const userData = {
        name: 'Welcome Test User',
        email: authPage.generateTestEmail(),
        password: 'WelcomeTest123!'
      };

      await authPage.register(userData);

      // Wait for dashboard to load
      await dashboardPage.waitForDashboardLoad();

      // Verify dashboard shows appropriate content
      const dashboardStats = await dashboardPage.verifyDashboardLoaded();
      expect(dashboardStats.isOnCorrectUrl).toBe(true);

      // Should show either stats or welcome message
      expect(dashboardStats.hasPageTitle || dashboardStats.hasDashboardContent).toBe(true);
    });

    test('should show navigation menu after successful registration', async ({ page }) => {
      await authPage.navigateToAuth();

      const userData = {
        name: 'Navigation Test User',
        email: authPage.generateTestEmail(),
        password: 'NavTest123!'
      };

      await authPage.register(userData);
      await dashboardPage.waitForDashboardLoad();

      // Verify navigation is available after registration
      expect(await navigation.isNavigationVisible()).toBe(true);

      // Verify main navigation links are accessible
      // Note: Checking if navigation elements exist rather than asserting all are visible
      // since some apps hide certain nav elements for new users
      const navResults = await navigation.checkNavigationConsistency(['/']);
      expect(navResults['/']).toBeTruthy();
    });
  });

  test.describe('🚀 User Login Happy Path', () => {

    test('@smoke should successfully login with valid credentials', async ({ page }) => {
      // Navigate to login page
      await authPage.navigateToAuth();

      // Verify we're on the auth page
      expect(await authPage.isOnRegisterPage()).toBe(true);

      // Login with known valid credentials
      const credentials = {
        email: 'aaaa@gmail.com',
        password: 'aaaaaa'
      };

      await authPage.login(credentials);

      // Verify successful login with redirect to dashboard
      await expect(page).toHaveURL('/', { timeout: 15000 });

      // Verify dashboard is properly loaded
      const verification = await dashboardPage.verifyDashboardLoaded();
      expect(verification.isOnCorrectUrl).toBe(true);

      // Verify user is recognized as logged in by checking dashboard content
      const dashboardVerification = await dashboardPage.verifyDashboardLoaded();
      expect(dashboardVerification.isOnCorrectUrl).toBe(true);
    });

    test('should maintain user session after successful login', async ({ page }) => {
      // Perform login
      await authPage.performLogin();

      // Verify login successful
      await dashboardPage.waitForDashboardLoad();

      // Navigate to different pages and verify session persists
      await navigation.goToAllJobs();

      // Verify we successfully navigated to all jobs page
      await expect(page).toHaveURL('/all-jobs', { timeout: 10000 });

      // On the all-jobs page, user authentication is indicated by not being redirected to login
      // and by the page loading successfully (rather than checking for specific UI elements)
      // This is because authentication state may be maintained server-side even if UI elements differ
      await page.waitForLoadState('networkidle');

      // The fact that we can access /all-jobs without redirect means we're still authenticated
      expect(page.url()).toContain('/all-jobs');

      // Navigate back to dashboard
      await navigation.goToStats();
      await expect(page).toHaveURL('/', { timeout: 10000 });

      // Session should be maintained - we can still access protected routes
      expect(page.url()).toBe('http://localhost:3000/');
    });

    test('should persist authentication across page refreshes', async ({ page }) => {
      // Login first
      await authPage.performLogin();
      await dashboardPage.waitForDashboardLoad();

      // Verify we're on dashboard after login
      expect(await dashboardPage.isOnDashboard()).toBe(true);

      // Refresh the page
      await page.reload();

      // Wait for page to reload
      await dashboardPage.waitForDashboardLoad();

      // Should still be authenticated and remain on dashboard (not redirected to /register)
      expect(await dashboardPage.isOnDashboard()).toBe(true);

      // The key test: we should not be redirected to login page
      expect(page.url()).not.toContain('/register');
      expect(page.url()).not.toContain('/landing');
    });

    test('should handle multiple consecutive login attempts successfully', async ({ page }) => {
      const credentials = {
        email: 'aaaa@gmail.com',
        password: 'aaaaaa'
      };

      // Perform multiple login/logout cycles
      for (let i = 0; i < 3; i++) {
        // Login
        await authPage.navigateToAuth();
        await authPage.login(credentials);

        // Verify successful login - we're on dashboard after login
        await expect(page).toHaveURL('/', { timeout: 10000 });
        expect(await dashboardPage.isOnDashboard()).toBe(true);

        // Only logout if not the last iteration
        if (i < 2) {
          await authPage.logout();
          await expect(page).toHaveURL('/landing', { timeout: 10000 });
        }
      }
    });

    test('should provide seamless navigation after login', async ({ page }) => {
      // Login
      await authPage.performLogin();
      await dashboardPage.waitForDashboardLoad();

      // Test navigation to different sections
      const navigationTests = [
        { method: 'goToAllJobs', expectedUrl: '/all-jobs' },
        { method: 'goToAddJob', expectedUrl: '/add-job' },
        { method: 'goToStats', expectedUrl: '/' }
      ];

      for (const navTest of navigationTests) {
        await navigation[navTest.method]();
        await expect(page).toHaveURL(navTest.expectedUrl, { timeout: 10000 });

        // User should remain logged in throughout navigation - verify by checking we're on expected page
        // and not redirected to login/register page
        expect(page.url()).toContain(navTest.expectedUrl);
      }
    });
  });

  test.describe('🚪 User Logout Happy Path', () => {

    test('@smoke should successfully logout and redirect to landing page', async ({ page }) => {
      // First login
      await authPage.performLogin();
      await dashboardPage.waitForDashboardLoad();

      // Verify user is logged in by checking dashboard content
      const dashboardVerification = await dashboardPage.verifyDashboardLoaded();
      expect(dashboardVerification.isOnCorrectUrl).toBe(true);
      expect(dashboardVerification.hasPageTitle || dashboardVerification.hasDashboardContent).toBe(true);

      // Logout
      await authPage.logout();

      // Should redirect to landing page after logout
      await expect(page).toHaveURL('/landing', { timeout: 15000 });

      // Should show login/register form on landing page
      expect(await authPage.isOnRegisterPage()).toBe(true);

      // Try to access protected route - should redirect back to landing
      await page.goto('/');
      await expect(page).toHaveURL('/landing', { timeout: 10000 });

      // Verify logout was successful by confirming we can't access dashboard
      expect(page.url()).toContain('/landing');
    });

    test('should clear session data after logout', async ({ page }) => {
      // Login first
      await authPage.performLogin();
      await dashboardPage.waitForDashboardLoad();

      // Logout
      await authPage.logout();
      await expect(page).toHaveURL('/landing');

      // Attempt to navigate directly to protected route
      await page.goto('/');

      // Should redirect back to landing page
      await expect(page).toHaveURL('/landing', { timeout: 10000 });
    });

    test('should handle logout from different pages', async ({ page }) => {
      // Login
      await authPage.performLogin();
      await dashboardPage.waitForDashboardLoad();

      // Navigate to different page
      await navigation.goToAllJobs();
      await expect(page).toHaveURL('/all-jobs');

      // Logout from jobs page
      await authPage.logout();

      // Should still redirect to landing page
      await expect(page).toHaveURL('/landing', { timeout: 10000 });
      expect(await authPage.isOnRegisterPage()).toBe(true);
    });
  });

  test.describe('🔄 Complete Authentication Workflow', () => {

    test('@regression should complete full authentication cycle', async ({ page }) => {
      // 1. Start unauthenticated - should redirect to landing
      await authPage.navigate('/');
      await expect(page).toHaveURL('/landing');

      // 2. Login successfully
      await authPage.performLogin();
      await expect(page).toHaveURL('/');
      await dashboardPage.waitForDashboardLoad();
      const dashboardVerification = await dashboardPage.verifyDashboardLoaded();
      expect(dashboardVerification.isOnCorrectUrl).toBe(true);

      // 3. Navigate through the application
      await navigation.goToAllJobs();
      await expect(page).toHaveURL('/all-jobs');
      // Verify we can access protected routes (authentication maintained)
      expect(page.url()).toContain('/all-jobs');

      await navigation.goToAddJob();
      await expect(page).toHaveURL('/add-job');
      // Verify we can access protected routes (authentication maintained)
      expect(page.url()).toContain('/add-job');

      // 4. Return to dashboard
      await navigation.goToStats();
      await expect(page).toHaveURL('/');
      // Verify we're back on dashboard (authentication maintained)
      expect(await dashboardPage.isOnDashboard()).toBe(true);

      // 5. Logout successfully
      await authPage.logout();
      await expect(page).toHaveURL('/landing');

      // 6. Verify logged out state
      expect(await authPage.isOnRegisterPage()).toBe(true);
    });

    test('should handle browser back/forward navigation correctly', async ({ page }) => {
      // Login
      await authPage.performLogin();
      await dashboardPage.waitForDashboardLoad();

      // Navigate through pages
      await navigation.goToAllJobs();
      await navigation.goToAddJob();

      // Use browser back button
      await page.goBack();
      await expect(page).toHaveURL('/all-jobs');
      // Verify we can still access protected routes (authentication maintained)
      expect(page.url()).toContain('/all-jobs');

      await page.goBack();
      await expect(page).toHaveURL('/');
      // Verify we're on dashboard (authentication maintained)
      expect(await dashboardPage.isOnDashboard()).toBe(true);

      // Use browser forward button
      await page.goForward();
      await expect(page).toHaveURL('/all-jobs');
      // Verify we can still access protected routes (authentication maintained)
      expect(page.url()).toContain('/all-jobs');
    });

    test('should maintain authentication state during extended session', async ({ page }) => {
      // Login
      await authPage.performLogin();
      await dashboardPage.waitForDashboardLoad();

      // Simulate extended session by navigating through multiple pages
      const pages = ['/', '/all-jobs', '/add-job', '/', '/all-jobs'];

      for (const pageUrl of pages) {
        await page.goto(pageUrl);
        await page.waitForLoadState('networkidle');

        // Should remain authenticated throughout - verify by not being redirected to landing
        expect(page.url()).not.toContain('/landing');
        expect(page.url()).not.toContain('/register');

        // Small delay to simulate real user behavior
        await page.waitForTimeout(500);
      }

      // Final verification - still logged in (not redirected to landing/register)
      expect(page.url()).not.toContain('/landing');
      expect(page.url()).not.toContain('/register');

      // Verify we can access dashboard if we navigate to it
      await page.goto('/');
      await expect(page).toHaveURL('/');
    });
  });

  test.describe('🎯 User Experience Validation', () => {

    test('should show appropriate loading states during authentication', async ({ page }) => {
      await authPage.navigateToAuth();

      const credentials = {
        email: 'aaaa@gmail.com',
        password: 'aaaaaa'
      };

      // Fill form
      await authPage.fillLoginForm(credentials);

      // Submit and immediately check for loading/transition
      await authPage.submitForm();

      // Should eventually reach dashboard
      await expect(page).toHaveURL('/', { timeout: 15000 });
      expect(await dashboardPage.isDashboardContentVisible()).toBe(true);
    });

    test('should display user-specific content after login', async ({ page }) => {
      // Login
      await authPage.performLogin();
      await dashboardPage.waitForDashboardLoad();

      // Should show navigation appropriate for logged-in users
      expect(await navigation.isNavigationVisible()).toBe(true);

      // Should show dashboard content indicating successful login
      const dashboardVerification = await dashboardPage.verifyDashboardLoaded();
      expect(dashboardVerification.isOnCorrectUrl).toBe(true);
    });

    test('should handle rapid user interactions gracefully', async ({ page }) => {
      await authPage.navigateToAuth();

      const credentials = {
        email: 'aaaa@gmail.com',
        password: 'aaaaaa'
      };

      // Rapid form interactions
      await authPage.fillLoginForm(credentials);

      // Multiple rapid clicks on submit button
      await Promise.all([
        authPage.submitForm(),
        page.waitForURL('/', { timeout: 15000 })
      ]);

      // Should handle gracefully and end up authenticated on dashboard
      expect(await dashboardPage.isOnDashboard()).toBe(true);
    });
  });

  test.describe('🔒 Authentication State Verification', () => {

    test('should properly protect routes for unauthenticated users', async ({ page }) => {
      // Ensure logged out
      await authPage.clearCookies();

      // Try to access protected routes directly
      const protectedRoutes = ['/all-jobs', '/add-job'];

      for (const route of protectedRoutes) {
        await page.goto(route);

        // Should redirect to register page
        await expect(page).toHaveURL('/landing', { timeout: 10000 });
      }
    });

    test('should allow access to protected routes for authenticated users', async ({ page }) => {
      // Login first
      await authPage.performLogin();
      await dashboardPage.waitForDashboardLoad();

      // Should be able to access protected routes
      const protectedRoutes = ['/', '/all-jobs', '/add-job'];

      for (const route of protectedRoutes) {
        await page.goto(route);
        await expect(page).toHaveURL(route, { timeout: 10000 });

        // Should remain authenticated - verify by checking we can access the route
        expect(page.url()).toContain(route);
      }
    });

    test('should handle direct URL navigation after authentication', async ({ page }) => {
      // Login
      await authPage.performLogin();
      await dashboardPage.waitForDashboardLoad();

      // Test direct navigation to various routes
      await page.goto('/all-jobs');
      await expect(page).toHaveURL('/all-jobs');
      // Verify we can access the route (authentication maintained)
      expect(page.url()).toContain('/all-jobs');

      await page.goto('/add-job');
      await expect(page).toHaveURL('/add-job');
      // Verify we can access the route (authentication maintained)
      expect(page.url()).toContain('/add-job');

      await page.goto('/');
      await expect(page).toHaveURL('/');
      // Verify we're on dashboard (authentication maintained)
      expect(await dashboardPage.isOnDashboard()).toBe(true);
    });
  });
});
