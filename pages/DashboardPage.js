/**
 * =====================================================
 * DASHBOARD PAGE OBJECT
 * =====================================================
 *
 * Page object for dashboard/stats functionality
 */

const BasePage = require('./BasePage');

class DashboardPage extends BasePage {
  constructor(page) {
    super(page);

    // Locators
    this.locators = {
      // Page content
      pageTitle: 'h1, h2, h3',
      dashboardContent: '[data-testid="dashboard"], .dashboard',

      // Statistics
      statsContainer: '[class*="stats"], .stat-card, .statistic',
      statCards: '.stat-card',
      pendingJobs: 'text=/pending/i',
      interviewJobs: 'text=/interview/i',
      declinedJobs: 'text=/declined/i',

      // Welcome message
      welcomeMessage: 'text=/Stats|Dashboard|Welcome/i'
    };
  }

  /**
   * Navigate to dashboard
   */
  async navigateToDashboard() {
    await this.navigate('/');
    await this.waitForUrl('/');
  }

  /**
   * Check if on dashboard page
   * @returns {boolean} True if on dashboard
   */
  async isOnDashboard() {
    return this.page.url().endsWith('/');
  }

  /**
   * Check if dashboard content is visible
   * @returns {boolean} True if dashboard content is visible
   */
  async isDashboardContentVisible() {
    return await this.isVisible(this.locators.dashboardContent) ||
           await this.isVisible(this.locators.pageTitle);
  }

  /**
   * Check if statistics are visible
   * @returns {boolean} True if stats are visible
   */
  async areStatsVisible() {
    return await this.isVisible(this.locators.statsContainer);
  }

  /**
   * Get dashboard page title
   * @returns {string} Page title text
   */
  async getPageTitle() {
    return await this.getTextContent(this.locators.pageTitle);
  }

  /**
   * Check if welcome message is displayed
   * @returns {boolean} True if welcome message is visible
   */
  async isWelcomeMessageVisible() {
    return await this.isVisible(this.locators.welcomeMessage);
  }

  /**
   * Get statistics information
   * @returns {Object} Statistics data
   */
  async getStatistics() {
    if (await this.areStatsVisible()) {
      return {
        hasStats: true,
        statCardCount: await this.getElementCount(this.locators.statCards),
        hasPendingJobs: await this.isVisible(this.locators.pendingJobs),
        hasInterviewJobs: await this.isVisible(this.locators.interviewJobs),
        hasDeclinedJobs: await this.isVisible(this.locators.declinedJobs)
      };
    }

    return {
      hasStats: false,
      statCardCount: 0,
      hasPendingJobs: false,
      hasInterviewJobs: false,
      hasDeclinedJobs: false
    };
  }

  /**
   * Wait for dashboard to load completely
   */
  async waitForDashboardLoad() {
    await this.waitForUrl('/');

    // Wait for either dashboard content or page title to be visible
    try {
      await this.waitForElement(this.locators.dashboardContent, 5000);
    } catch {
      await this.waitForElement(this.locators.pageTitle, 5000);
    }
  }

  /**
   * Verify dashboard is properly loaded
   * @returns {Object} Verification results
   */
  async verifyDashboardLoaded() {
    return {
      isOnCorrectUrl: await this.isOnDashboard(),
      hasPageTitle: await this.isVisible(this.locators.pageTitle),
      hasDashboardContent: await this.isDashboardContentVisible(),
      hasStats: await this.areStatsVisible(),
      hasWelcomeMessage: await this.isWelcomeMessageVisible()
    };
  }
}

module.exports = DashboardPage;
