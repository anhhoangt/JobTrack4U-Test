/**
 * =====================================================
 * TIMELINE PAGE OBJECT
 * =====================================================
 *
 * Page object for timeline functionality (Phase 3)
 */

const BasePage = require('./BasePage');

class TimelinePage extends BasePage {
  constructor(page) {
    super(page);

    // Locators
    this.locators = {
      // Page elements
      pageTitle: 'h3',

      // Timeline controls
      allActivitiesButton: 'button:has-text("All Activities")',
      byJobButton: 'button:has-text("By Job")',
      jobSelector: 'select#jobSelect',
      jobSelectorLabel: 'label[for="jobSelect"]',
      jobSelectorPlaceholder: 'select#jobSelect option[value=""]',

      // Timeline preview
      timelinePreview: '.timeline-preview',
      timelinePreviewTitle: 'h5:has-text("Timeline Preview")',
      previewTimelineItems: '.preview-timeline-item',
      previewIcon: '.preview-icon',
      previewContent: '.preview-content',
      previewContentTitle: '.preview-content h6',
      previewContentText: '.preview-content p',

      // Timeline statistics
      timelineStats: '.timeline-stats',
      statCards: '.stat-card',
      totalActivitiesStat: '.stat-card:has-text("Total Activities")',
      pendingStat: '.stat-card:has-text("Pending")',
      completedStat: '.stat-card:has-text("Completed")',

      // Timeline controls preview
      timelineControlsPreview: '.timeline-controls-preview',
      previewControlsTitle: 'h5:has-text("Preview: Timeline Controls")',

      // Coming soon section
      comingSoonTitle: 'h4:has-text("Timeline View Coming Soon")',
      featureDescription: 'text=Chronological view of all your job application activities',
      visualTimelineDescription: 'text=Visual timeline with activity types and priorities',
      filterDescription: 'text=Filter by specific jobs or view all activities',

      // Info message
      infoMessage: '.info-message',
      featureBullets: '.info-message li',

      // Empty state
      noTimelineData: '.no-timeline-data',
      noTimelineDataTitle: '.no-timeline-data h4',

      // Active button states
      primaryButton: '.btn-primary'
    };
  }

  /**
   * Navigate to timeline page
   */
  async navigateToTimeline() {
    await this.navigate('/timeline');
    await this.waitForUrl('/timeline');
  }

  /**
   * Check if on timeline page
   * @returns {boolean} True if on timeline page
   */
  async isOnTimelinePage() {
    return this.page.url().includes('/timeline');
  }

  /**
   * Get page title
   * @returns {string} Page title text
   */
  async getPageTitle() {
    return await this.getTextContent(this.locators.pageTitle);
  }

  /**
   * Check if timeline controls are visible
   * @returns {boolean} True if timeline controls are visible
   */
  async areTimelineControlsVisible() {
    return await this.isVisible(this.locators.allActivitiesButton) &&
           await this.isVisible(this.locators.byJobButton);
  }

  /**
   * Switch to "All Activities" mode
   */
  async switchToAllActivitiesMode() {
    await this.clickElement(this.locators.allActivitiesButton);
  }

  /**
   * Switch to "By Job" mode
   */
  async switchToByJobMode() {
    await this.clickElement(this.locators.byJobButton);
  }

  /**
   * Check if "All Activities" button is active
   * @returns {boolean} True if "All Activities" button is active
   */
  async isAllActivitiesButtonActive() {
    const button = this.page.locator(this.locators.allActivitiesButton);
    return await button.locator(this.locators.primaryButton).isVisible();
  }

  /**
   * Check if "By Job" button is active
   * @returns {boolean} True if "By Job" button is active
   */
  async isByJobButtonActive() {
    const button = this.page.locator(this.locators.byJobButton);
    return await button.locator(this.locators.primaryButton).isVisible();
  }

  /**
   * Check if job selector is visible
   * @returns {boolean} True if job selector is visible
   */
  async isJobSelectorVisible() {
    return await this.isVisible(this.locators.jobSelector);
  }

  /**
   * Get job selector options count
   * @returns {number} Number of job options
   */
  async getJobSelectorOptionsCount() {
    const options = this.page.locator(`${this.locators.jobSelector} option[value!=""]`);
    return await options.count();
  }

  /**
   * Select job from dropdown
   * @param {string} jobValue - Job value to select
   */
  async selectJob(jobValue) {
    await this.selectOption(this.locators.jobSelector, jobValue);
  }

  /**
   * Check if timeline preview is visible
   * @returns {boolean} True if timeline preview is visible
   */
  async isTimelinePreviewVisible() {
    return await this.isVisible(this.locators.timelinePreview);
  }

  /**
   * Get timeline preview items count
   * @returns {number} Number of preview timeline items
   */
  async getPreviewItemsCount() {
    return await this.getElementCount(this.locators.previewTimelineItems);
  }

  /**
   * Check if preview items have required elements
   * @returns {Object} Preview items structure verification
   */
  async verifyPreviewItemsStructure() {
    const firstItem = this.page.locator(this.locators.previewTimelineItems).first();

    if (!(await firstItem.isVisible())) {
      return { hasItems: false };
    }

    return {
      hasItems: true,
      hasIcon: await firstItem.locator(this.locators.previewIcon).isVisible(),
      hasContent: await firstItem.locator(this.locators.previewContent).isVisible(),
      hasTitle: await firstItem.locator(this.locators.previewContentTitle).isVisible(),
      hasText: await firstItem.locator(this.locators.previewContentText).isVisible()
    };
  }

  /**
   * Check if different activity types appear in preview
   * @returns {Object} Activity types presence
   */
  async checkActivityTypesInPreview() {
    return {
      hasApplicationSent: await this.page.locator(this.locators.previewTimelineItems).filter({ hasText: 'Application Sent' }).isVisible(),
      hasEmailReceived: await this.page.locator(this.locators.previewTimelineItems).filter({ hasText: 'Email Received' }).isVisible(),
      hasInterviewScheduled: await this.page.locator(this.locators.previewTimelineItems).filter({ hasText: 'Interview Scheduled' }).isVisible()
    };
  }

  /**
   * Check if preview icons have background colors
   * @returns {boolean} True if icons have styled backgrounds
   */
  async doPreviewIconsHaveColors() {
    const icons = this.page.locator(this.locators.previewIcon);
    const iconCount = await icons.count();

    if (iconCount === 0) return false;

    for (let i = 0; i < Math.min(iconCount, 3); i++) {
      const icon = icons.nth(i);
      const style = await icon.getAttribute('style');
      if (!style || !style.includes('background-color')) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if timeline statistics are visible
   * @returns {boolean} True if timeline stats are visible
   */
  async areTimelineStatsVisible() {
    return await this.isVisible(this.locators.timelineStats);
  }

  /**
   * Get timeline statistics information
   * @returns {Object} Timeline statistics data
   */
  async getTimelineStats() {
    if (!(await this.areTimelineStatsVisible())) {
      return { hasStats: false };
    }

    return {
      hasStats: true,
      hasStatCards: await this.isVisible(this.locators.statCards),
      hasTotalActivities: await this.isVisible(this.locators.totalActivitiesStat),
      hasPending: await this.isVisible(this.locators.pendingStat),
      hasCompleted: await this.isVisible(this.locators.completedStat)
    };
  }

  /**
   * Check if "Coming Soon" message is displayed
   * @returns {boolean} True if coming soon message is visible
   */
  async isComingSoonMessageVisible() {
    return await this.isVisible(this.locators.comingSoonTitle);
  }

  /**
   * Check if feature descriptions are visible
   * @returns {Object} Feature descriptions visibility
   */
  async checkFeatureDescriptions() {
    return {
      hasChronologicalView: await this.isVisible(this.locators.featureDescription),
      hasVisualTimeline: await this.isVisible(this.locators.visualTimelineDescription),
      hasFilterDescription: await this.isVisible(this.locators.filterDescription)
    };
  }

  /**
   * Check if info message with feature bullets is visible
   * @returns {Object} Info message details
   */
  async checkInfoMessage() {
    if (!(await this.isVisible(this.locators.infoMessage))) {
      return { hasInfoMessage: false, bulletCount: 0 };
    }

    return {
      hasInfoMessage: true,
      bulletCount: await this.getElementCount(this.locators.featureBullets),
      hasPreviewControls: await this.isVisible(this.locators.previewControlsTitle)
    };
  }

  /**
   * Check if empty timeline state is handled
   * @returns {Object} Empty state information
   */
  async checkEmptyTimelineState() {
    const hasTimelineItems = await this.getPreviewItemsCount() > 0;
    const hasEmptyState = await this.isVisible(this.locators.noTimelineData);

    return {
      hasTimelineItems,
      hasEmptyState,
      isEmptyStateCorrect: hasEmptyState ? await this.getTextContent(this.locators.noTimelineDataTitle).then(text => text.includes('No activities found')) : false
    };
  }

  /**
   * Check if timestamps are displayed in preview items
   * @returns {boolean} True if timestamps are visible
   */
  async areTimestampsVisible() {
    const previewItems = this.page.locator(this.locators.previewTimelineItems);
    const itemCount = await previewItems.count();

    if (itemCount === 0) return false;

    const firstItem = previewItems.first();
    return await firstItem.locator('small').isVisible();
  }

  /**
   * Check if different time periods are shown
   * @returns {boolean} True if different time periods are displayed
   */
  async areTimePeriodIndicatorsVisible() {
    const timeIndicators = this.page.locator('small:has-text("days ago"), small:has-text("day ago"), small:has-text("Coming up")');
    return await timeIndicators.isVisible();
  }

  /**
   * Test responsive design by setting mobile viewport
   */
  async testResponsiveDesign() {
    await this.setViewportSize(375, 667);

    return {
      controlsVisible: await this.areTimelineControlsVisible(),
      previewVisible: await this.isTimelinePreviewVisible()
    };
  }

  /**
   * Check if development status is consistently shown
   * @returns {Object} Development status information
   */
  async checkDevelopmentStatus() {
    return {
      hasInfoMessage: await this.isVisible(this.locators.infoMessage),
      hasPreviewControlsTitle: await this.isVisible(this.locators.previewControlsTitle),
      bulletCount: await this.getElementCount(this.locators.featureBullets)
    };
  }

  /**
   * Test view mode toggle functionality
   * @returns {Object} Toggle test results
   */
  async testViewModeToggle() {
    // Start state
    const initialAllActivitiesActive = await this.isAllActivitiesButtonActive();

    // Switch to By Job mode
    await this.switchToByJobMode();
    const byJobActive = await this.isByJobButtonActive();
    const jobSelectorVisible = await this.isJobSelectorVisible();

    // Switch back to All Activities
    await this.switchToAllActivitiesMode();
    const allActivitiesActiveAgain = await this.isAllActivitiesButtonActive();
    const jobSelectorHidden = !(await this.isJobSelectorVisible());

    return {
      initialAllActivitiesActive,
      byJobActive,
      jobSelectorVisibleInByJobMode: jobSelectorVisible,
      allActivitiesActiveAgain,
      jobSelectorHiddenInAllActivitiesMode: jobSelectorHidden
    };
  }

  /**
   * Wait for timeline page to load
   */
  async waitForTimelineLoad() {
    await this.waitForElement(this.locators.pageTitle, 5000);
    await this.waitForElement(this.locators.allActivitiesButton, 5000);
  }

  /**
   * Verify timeline page is properly loaded
   * @returns {Object} Verification results
   */
  async verifyTimelinePageLoaded() {
    return {
      isOnCorrectUrl: await this.isOnTimelinePage(),
      hasPageTitle: await this.isVisible(this.locators.pageTitle),
      hasTimelineControls: await this.areTimelineControlsVisible(),
      hasTimelinePreview: await this.isTimelinePreviewVisible(),
      hasComingSoonMessage: await this.isComingSoonMessageVisible()
    };
  }
}

module.exports = TimelinePage;
