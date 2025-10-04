/**
 * =====================================================
 * NAVIGATION COMPONENT PAGE OBJECT
 * =====================================================
 *
 * Page object for shared navigation functionality
 */

const BasePage = require('./BasePage');

class NavigationComponent extends BasePage {
  constructor(page) {
    super(page);

    // Locators
    this.locators = {
      // Main navigation links
      statsLink: 'a[href="/"], a:has-text("Stats")',
      allJobsLink: 'a[href="/all-jobs"], a:has-text("All Jobs")',
      addJobLink: 'a[href="/add-job"], a:has-text("Add Job")',
      activitiesLink: 'a[href="/activities"], a:has-text("Activities")',
      timelineLink: 'a[href="/timeline"], a:has-text("Timeline")',
      profileLink: 'a[href="/profile"], a:has-text("Profile")',

      // Navigation containers
      navigation: 'nav, .navigation, .navbar, .sidebar',
      sidebar: '.sidebar, .nav-sidebar, .side-nav',

      // Mobile navigation
      mobileToggle: '[data-testid="mobile-toggle"], .mobile-menu-toggle, .hamburger-menu, button[aria-label*="menu"]',
      mobileNav: '.mobile-nav, .sidebar, .nav-mobile',

      // User info and logout
      userInfo: '[data-testid="user-info"], .user-info, .nav-user',
      userMenu: '[data-testid="user-menu"], .user-dropdown, .nav-user',
      logoutButton: 'button:has-text("Logout"), a:has-text("Logout"), [data-testid="logout-button"]',

      // App branding
      logo: '[data-testid="logo"], .logo, img[alt*="logo"], .app-title, h1',

      // Active states
      activeLink: '.active, .nav-link.active'
    };
  }

  /**
   * Navigate to dashboard/stats page
   */
  async goToStats() {
    await this.clickElement(this.locators.statsLink);
    await this.waitForUrl('/');
  }

  /**
   * Navigate to all jobs page
   */
  async goToAllJobs() {
    await this.clickElement(this.locators.allJobsLink);
    await this.waitForUrl('/all-jobs');
  }

  /**
   * Navigate to add job page
   */
  async goToAddJob() {
    await this.clickElement(this.locators.addJobLink);
    await this.waitForUrl('/add-job');
  }

  /**
   * Navigate to activities page
   */
  async goToActivities() {
    await this.clickElement(this.locators.activitiesLink);
    await this.waitForUrl('/activities');
  }

  /**
   * Navigate to timeline page
   */
  async goToTimeline() {
    await this.clickElement(this.locators.timelineLink);
    await this.waitForUrl('/timeline');
  }

  /**
   * Navigate to profile page
   */
  async goToProfile() {
    await this.clickElement(this.locators.profileLink);
    await this.waitForUrl('/profile');
  }

  /**
   * Check if all main navigation links are visible
   * @returns {boolean} True if all links are visible
   */
  async areMainNavLinksVisible() {
    const links = [
      this.locators.statsLink,
      this.locators.allJobsLink,
      this.locators.addJobLink,
      this.locators.activitiesLink,
      this.locators.timelineLink,
      this.locators.profileLink
    ];

    for (const link of links) {
      if (!(await this.isVisible(link))) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check if navigation container is visible
   * @returns {boolean} True if navigation is visible
   */
  async isNavigationVisible() {
    return await this.isVisible(this.locators.navigation);
  }

  /**
   * Check if sidebar navigation is visible
   * @returns {boolean} True if sidebar is visible
   */
  async isSidebarVisible() {
    return await this.isVisible(this.locators.sidebar);
  }

  /**
   * Handle mobile navigation toggle
   */
  async toggleMobileNav() {
    if (await this.isVisible(this.locators.mobileToggle)) {
      await this.clickElement(this.locators.mobileToggle);
      return true;
    }
    return false;
  }

  /**
   * Check if mobile navigation is visible
   * @returns {boolean} True if mobile nav is visible
   */
  async isMobileNavVisible() {
    return await this.isVisible(this.locators.mobileNav);
  }

  /**
   * Navigate using mobile menu
   * @param {string} destination - Destination page ('all-jobs', 'add-job', etc.)
   */
  async navigateViaMobile(destination) {
    await this.toggleMobileNav();

    switch (destination) {
      case 'all-jobs':
        await this.goToAllJobs();
        break;
      case 'add-job':
        await this.goToAddJob();
        break;
      case 'activities':
        await this.goToActivities();
        break;
      case 'timeline':
        await this.goToTimeline();
        break;
      case 'profile':
        await this.goToProfile();
        break;
      default:
        await this.goToStats();
    }
  }

  /**
   * Navigate using sidebar
   * @param {string} destination - Destination page
   */
  async navigateViaSidebar(destination) {
    const sidebar = this.page.locator(this.locators.sidebar);

    switch (destination) {
      case 'all-jobs':
        await sidebar.locator(this.locators.allJobsLink).click();
        break;
      case 'add-job':
        await sidebar.locator(this.locators.addJobLink).click();
        break;
      case 'activities':
        await sidebar.locator(this.locators.activitiesLink).click();
        break;
      case 'timeline':
        await sidebar.locator(this.locators.timelineLink).click();
        break;
      case 'profile':
        await sidebar.locator(this.locators.profileLink).click();
        break;
      default:
        await sidebar.locator(this.locators.statsLink).click();
    }
  }

  /**
   * Check if user info is displayed
   * @returns {boolean} True if user info is visible
   */
  async isUserInfoVisible() {
    return await this.isVisible(this.locators.userInfo);
  }

  /**
   * Get user info text
   * @returns {string} User info text
   */
  async getUserInfo() {
    if (await this.isUserInfoVisible()) {
      return await this.getTextContent(this.locators.userInfo);
    }
    return '';
  }

  /**
   * Logout user through navigation
   */
  async logout() {
    const logoutButton = this.page.locator(this.locators.logoutButton);

    // Try to find logout in user menu if not directly visible
    if (!(await logoutButton.isVisible())) {
      const userMenu = this.page.locator(this.locators.userMenu);
      if (await userMenu.isVisible()) {
        await this.clickElement(this.locators.userMenu);
      }
    }

    await this.clickElement(this.locators.logoutButton);
    await this.waitForUrl('/register');
  }

  /**
   * Check if app logo is visible
   * @returns {boolean} True if logo is visible
   */
  async isLogoVisible() {
    return await this.isVisible(this.locators.logo);
  }

  /**
   * Check if active navigation state is shown
   * @param {string} expectedPath - Expected active path
   * @returns {boolean} True if active state is visible
   */
  async isActiveLinkHighlighted(expectedPath) {
    const activeLink = this.page.locator(`${this.locators.activeLink}[href="${expectedPath}"]`);
    return await activeLink.isVisible();
  }

  /**
   * Test direct navigation to all pages
   * @param {Array} pages - Array of page URLs to test
   */
  async testDirectNavigation(pages) {
    const results = {};

    for (const pageUrl of pages) {
      try {
        await this.navigate(pageUrl);
        await this.waitForUrl(pageUrl);
        results[pageUrl] = 'success';
      } catch (error) {
        results[pageUrl] = 'failed';
      }
    }

    return results;
  }

  /**
   * Test browser navigation (back/forward)
   */
  async testBrowserNavigation() {
    // Navigate through pages
    await this.goToAllJobs();
    await this.goToAddJob();

    // Test back navigation
    await this.goBack();
    const isOnAllJobs = this.page.url().includes('/all-jobs');

    await this.goBack();
    const isOnDashboard = this.page.url() === `${this.page.url().split('/')[0]}//${this.page.url().split('/')[2]}/`;

    // Test forward navigation
    await this.goForward();
    const backToAllJobs = this.page.url().includes('/all-jobs');

    return {
      backToAllJobs: isOnAllJobs,
      backToDashboard: isOnDashboard,
      forwardToAllJobs: backToAllJobs
    };
  }

  /**
   * Check navigation consistency across pages
   * @param {Array} pages - Pages to check
   * @returns {Object} Results of navigation consistency check
   */
  async checkNavigationConsistency(pages) {
    const results = {};

    for (const pageUrl of pages) {
      await this.navigate(pageUrl);
      results[pageUrl] = {
        navigationVisible: await this.isNavigationVisible(),
        statsLinkVisible: await this.isVisible(this.locators.statsLink),
        allJobsLinkVisible: await this.isVisible(this.locators.allJobsLink),
        addJobLinkVisible: await this.isVisible(this.locators.addJobLink)
      };
    }

    return results;
  }
}

module.exports = NavigationComponent;
