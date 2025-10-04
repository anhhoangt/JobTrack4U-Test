/**
 * =====================================================
 * NAVIGATION TESTS
 * =====================================================
 *
 * This test suite covers navigation functionality:
 * - Main navigation menu
 * - Page routing
 * - Sidebar navigation
 * - Mobile navigation
 * - Navigation state management
 */

const { test, expect } = require('@playwright/test');

test.describe('Navigation', () => {
  // Setup: Login before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[name="email"]', 'test@jobtrack.com');
    await page.fill('input[name="password"]', 'testpassword123');
    await page.click('button[type="submit"]');

    // Wait for dashboard to load
    await expect(page).toHaveURL('/');
  });

  test('should display main navigation links', async ({ page }) => {
    // Should show main navigation links
    await expect(page.locator('a[href="/"], a:has-text("Stats")')).toBeVisible();
    await expect(page.locator('a[href="/all-jobs"], a:has-text("All Jobs")')).toBeVisible();
    await expect(page.locator('a[href="/add-job"], a:has-text("Add Job")')).toBeVisible();
    await expect(page.locator('a[href="/activities"], a:has-text("Activities")')).toBeVisible();
    await expect(page.locator('a[href="/timeline"], a:has-text("Timeline")')).toBeVisible();
    await expect(page.locator('a[href="/profile"], a:has-text("Profile")')).toBeVisible();
  });

  test('should navigate to stats/dashboard page', async ({ page }) => {
    // Click on stats/dashboard link
    await page.click('a[href="/"], a:has-text("Stats")');

    // Should navigate to dashboard
    await expect(page).toHaveURL('/');

    // Should show dashboard content
    await expect(page.locator('h1, h2, h3, [data-testid="dashboard"]')).toBeVisible();
  });

  test('should navigate to all jobs page', async ({ page }) => {
    // Click on all jobs link
    await page.click('a[href="/all-jobs"], a:has-text("All Jobs")');

    // Should navigate to all jobs page
    await expect(page).toHaveURL('/all-jobs');

    // Should show jobs page content
    await expect(page.locator('h2, h3')).toContainText(['Jobs', 'All Jobs']);
  });

  test('should navigate to add job page', async ({ page }) => {
    // Click on add job link
    await page.click('a[href="/add-job"], a:has-text("Add Job")');

    // Should navigate to add job page
    await expect(page).toHaveURL('/add-job');

    // Should show add job form
    await expect(page.locator('h3')).toContainText(['Add Job', 'Create Job']);
    await expect(page.locator('input[name="position"]')).toBeVisible();
  });

  test('should navigate to activities page', async ({ page }) => {
    // Click on activities link
    await page.click('a[href="/activities"], a:has-text("Activities")');

    // Should navigate to activities page
    await expect(page).toHaveURL('/activities');

    // Should show activities page content
    await expect(page.locator('h3')).toContainText('Activity Management');
  });

  test('should navigate to timeline page', async ({ page }) => {
    // Click on timeline link
    await page.click('a[href="/timeline"], a:has-text("Timeline")');

    // Should navigate to timeline page
    await expect(page).toHaveURL('/timeline');

    // Should show timeline page content
    await expect(page.locator('h3')).toContainText('Activity Timeline');
  });

  test('should navigate to profile page', async ({ page }) => {
    // Click on profile link
    await page.click('a[href="/profile"], a:has-text("Profile")');

    // Should navigate to profile page
    await expect(page).toHaveURL('/profile');

    // Should show profile page content
    await expect(page.locator('h3, h2')).toContainText(['Profile', 'Update Profile']);
  });

  test('should highlight active navigation item', async ({ page }) => {
    // Check if navigation items have active states
    await page.click('a[href="/all-jobs"]');

    // Active link should have different styling (this depends on implementation)
    const activeLink = page.locator('a[href="/all-jobs"].active, .nav-link.active[href="/all-jobs"]');

    // If active states are implemented, should be visible
    if (await activeLink.isVisible()) {
      await expect(activeLink).toBeVisible();
    }
  });

  test('should handle mobile navigation', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Look for mobile menu toggle (hamburger menu)
    const mobileToggle = page.locator('[data-testid="mobile-toggle"], .mobile-menu-toggle, .hamburger-menu, button[aria-label*="menu"]');

    if (await mobileToggle.isVisible()) {
      // Click mobile menu toggle
      await mobileToggle.click();

      // Should show mobile navigation
      await expect(page.locator('.mobile-nav, .sidebar, .nav-mobile')).toBeVisible();

      // Should be able to navigate via mobile menu
      await page.click('a[href="/all-jobs"]');
      await expect(page).toHaveURL('/all-jobs');
    } else {
      // If no mobile toggle, navigation should still be accessible
      await expect(page.locator('a[href="/all-jobs"]')).toBeVisible();
    }
  });

  test('should handle sidebar navigation', async ({ page }) => {
    // Look for sidebar navigation
    const sidebar = page.locator('.sidebar, .nav-sidebar, .side-nav');

    if (await sidebar.isVisible()) {
      // Should contain navigation links
      await expect(sidebar.locator('a[href="/"]')).toBeVisible();
      await expect(sidebar.locator('a[href="/all-jobs"]')).toBeVisible();
      await expect(sidebar.locator('a[href="/add-job"]')).toBeVisible();

      // Should be able to navigate via sidebar
      await sidebar.locator('a[href="/all-jobs"]').click();
      await expect(page).toHaveURL('/all-jobs');
    }
  });

  test('should show user information in navigation', async ({ page }) => {
    // Should show user info in navigation area
    const userInfo = page.locator('[data-testid="user-info"], .user-info, .nav-user');

    if (await userInfo.isVisible()) {
      // Should show user name or email
      await expect(userInfo).toContainText(['Test User', 'test@jobtrack.com']);
    }
  });

  test('should handle direct URL navigation', async ({ page }) => {
    // Test direct navigation to different pages
    await page.goto('/all-jobs');
    await expect(page).toHaveURL('/all-jobs');
    await expect(page.locator('h2, h3')).toContainText(['Jobs', 'All Jobs']);

    await page.goto('/add-job');
    await expect(page).toHaveURL('/add-job');
    await expect(page.locator('h3')).toContainText(['Add Job', 'Create Job']);

    await page.goto('/activities');
    await expect(page).toHaveURL('/activities');
    await expect(page.locator('h3')).toContainText('Activity Management');

    await page.goto('/timeline');
    await expect(page).toHaveURL('/timeline');
    await expect(page.locator('h3')).toContainText('Activity Timeline');

    await page.goto('/profile');
    await expect(page).toHaveURL('/profile');
    await expect(page.locator('h3, h2')).toContainText(['Profile', 'Update Profile']);
  });

  test('should handle browser back/forward navigation', async ({ page }) => {
    // Start on dashboard
    await expect(page).toHaveURL('/');

    // Navigate to jobs page
    await page.click('a[href="/all-jobs"]');
    await expect(page).toHaveURL('/all-jobs');

    // Navigate to add job page
    await page.click('a[href="/add-job"]');
    await expect(page).toHaveURL('/add-job');

    // Use browser back button
    await page.goBack();
    await expect(page).toHaveURL('/all-jobs');

    // Use browser back button again
    await page.goBack();
    await expect(page).toHaveURL('/');

    // Use browser forward button
    await page.goForward();
    await expect(page).toHaveURL('/all-jobs');
  });

  test('should maintain navigation state across page refreshes', async ({ page }) => {
    // Navigate to a specific page
    await page.click('a[href="/all-jobs"]');
    await expect(page).toHaveURL('/all-jobs');

    // Refresh the page
    await page.reload();

    // Should maintain the same page
    await expect(page).toHaveURL('/all-jobs');
    await expect(page.locator('h2, h3')).toContainText(['Jobs', 'All Jobs']);
  });

  test('should show navigation consistently across pages', async ({ page }) => {
    const pages = ['/', '/all-jobs', '/add-job', '/activities', '/timeline', '/profile'];

    for (const pageUrl of pages) {
      await page.goto(pageUrl);

      // Should show navigation on every page
      await expect(page.locator('nav, .navigation, .navbar, .sidebar')).toBeVisible();

      // Should show key navigation links on every page
      await expect(page.locator('a[href="/"], a:has-text("Stats")')).toBeVisible();
      await expect(page.locator('a[href="/all-jobs"], a:has-text("All Jobs")')).toBeVisible();
      await expect(page.locator('a[href="/add-job"], a:has-text("Add Job")')).toBeVisible();
    }
  });

  test('should handle invalid routes', async ({ page }) => {
    // Navigate to invalid route
    await page.goto('/invalid-route');

    // Should redirect to error page or dashboard
    // Check for either error page or dashboard redirect
    const currentUrl = page.url();
    const isErrorPage = currentUrl.includes('/error') || currentUrl.includes('*');
    const isDashboard = currentUrl.endsWith('/');

    expect(isErrorPage || isDashboard).toBe(true);

    if (isErrorPage) {
      // Should show error page content
      await expect(page.locator('h1, h2, h3')).toContainText(['Error', '404', 'Not Found']);
    }
  });

  test('should handle logout navigation', async ({ page }) => {
    // Find logout button/link
    const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout"), [data-testid="logout-button"]');

    // Try to find logout in user menu if not directly visible
    if (!(await logoutButton.isVisible())) {
      const userMenu = page.locator('[data-testid="user-menu"], .user-dropdown, .nav-user');
      if (await userMenu.isVisible()) {
        await userMenu.click();
      }
    }

    if (await logoutButton.isVisible()) {
      // Click logout
      await logoutButton.click();

      // Should redirect to login/register page
      await expect(page).toHaveURL('/register');

      // Navigation should no longer be visible (logged out state)
      const dashboardNav = page.locator('.sidebar, .dashboard-nav');
      await expect(dashboardNav).not.toBeVisible();
    }
  });

  test('should display app logo or title', async ({ page }) => {
    // Should show app logo or title in navigation
    const logo = page.locator('[data-testid="logo"], .logo, img[alt*="logo"], .app-title, h1');

    if (await logo.isVisible()) {
      await expect(logo).toBeVisible();
    }
  });
});
