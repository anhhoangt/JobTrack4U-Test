/**
 * =====================================================
 * ACTIVITIES PAGE OBJECT
 * =====================================================
 *
 * Page object for activities management functionality (Phase 3)
 */

const BasePage = require('./BasePage');

class ActivitiesPage extends BasePage {
  constructor(page) {
    super(page);

    // Locators
    this.locators = {
      // Page elements
      pageTitle: 'h3',

      // Activities container
      activitiesContainer: '.activities-container',
      activityCards: '.activity-card',

      // Filters
      activityTypeFilter: 'select[name="activityType"]',
      activityStatusFilter: 'select[name="activityStatus"]',
      clearFiltersButton: 'button:has-text("Clear Filters")',

      // Activity card elements
      activityTitle: '.activity-title',
      activityType: '.activity-type',
      statusBadge: '.status-badge',
      priorityBadge: '.priority-badge',
      createdDate: '.created-date',
      scheduledDate: '.scheduled-date',
      completedDate: '.completed-date',
      jobReference: '.job-reference',

      // Activity actions
      activityActions: '.activity-actions',
      markCompleteButton: 'button:has-text("Mark Complete")',
      deleteButton: 'button:has-text("Delete")',

      // Activity states
      pendingActivity: '.activity-card.pending',
      completedActivity: '.activity-card.completed',

      // Priority classes
      highPriorityCard: '.activity-card.priority-high',
      mediumPriorityCard: '.activity-card.priority-medium',
      lowPriorityCard: '.activity-card.priority-low',

      // Priority badges
      highPriorityBadge: '.priority-badge.priority-high',
      mediumPriorityBadge: '.priority-badge.priority-medium',
      lowPriorityBadge: '.priority-badge.priority-low',

      // Empty state
      noActivities: '.no-activities',
      noActivitiesTitle: '.no-activities h4',

      // Activity count
      activitiesCount: '.activities-count',

      // Success/error messages
      alertMessage: '[class*="alert"], .success'
    };
  }

  /**
   * Navigate to activities page
   */
  async navigateToActivities() {
    await this.navigate('/activities');
    await this.waitForUrl('/activities');
  }

  /**
   * Check if on activities page
   * @returns {boolean} True if on activities page
   */
  async isOnActivitiesPage() {
    return this.page.url().includes('/activities');
  }

  /**
   * Get page title
   * @returns {string} Page title text
   */
  async getPageTitle() {
    return await this.getTextContent(this.locators.pageTitle);
  }

  /**
   * Check if activities container is visible
   * @returns {boolean} True if activities container is visible
   */
  async isActivitiesContainerVisible() {
    return await this.isVisible(this.locators.activitiesContainer);
  }

  /**
   * Get activity cards count
   * @returns {number} Number of activity cards
   */
  async getActivityCardsCount() {
    return await this.getElementCount(this.locators.activityCards);
  }

  /**
   * Check if filter options are visible
   * @returns {boolean} True if filters are visible
   */
  async areFiltersVisible() {
    return await this.isVisible(this.locators.activityTypeFilter) &&
           await this.isVisible(this.locators.activityStatusFilter);
  }

  /**
   * Filter activities by type
   * @param {string} activityType - Activity type to filter by
   */
  async filterByType(activityType) {
    await this.selectOption(this.locators.activityTypeFilter, activityType);
    await this.waitForTimeout(1000);
  }

  /**
   * Filter activities by status
   * @param {string} status - Activity status to filter by
   */
  async filterByStatus(status) {
    await this.selectOption(this.locators.activityStatusFilter, status);
    await this.waitForTimeout(1000);
  }

  /**
   * Clear activity filters
   */
  async clearFilters() {
    await this.clickElement(this.locators.clearFiltersButton);
  }

  /**
   * Get current filter values
   * @returns {Object} Current filter values
   */
  async getCurrentFilters() {
    return {
      type: await this.page.locator(this.locators.activityTypeFilter).inputValue(),
      status: await this.page.locator(this.locators.activityStatusFilter).inputValue()
    };
  }

  /**
   * Check if activities or empty state is shown
   * @returns {Object} State information
   */
  async getActivitiesState() {
    const hasActivities = await this.getActivityCardsCount() > 0;
    const hasEmptyState = await this.isVisible(this.locators.noActivities);

    return {
      hasActivities,
      hasEmptyState,
      activityCount: hasActivities ? await this.getActivityCardsCount() : 0
    };
  }

  /**
   * Mark first pending activity as complete
   */
  async markFirstPendingActivityComplete() {
    const pendingActivity = this.page.locator(this.locators.pendingActivity).first();

    if (await pendingActivity.isVisible()) {
      await pendingActivity.locator(this.locators.markCompleteButton).click();
      await this.waitForTimeout(1000);
      return true;
    }
    return false;
  }

  /**
   * Delete first activity
   */
  async deleteFirstActivity() {
    const firstActivity = this.page.locator(this.locators.activityCards).first();

    if (await firstActivity.isVisible()) {
      const activityTitle = await firstActivity.locator(this.locators.activityTitle).textContent();

      // Set up dialog handler for confirmation
      this.setupDialogHandler(true);

      await firstActivity.locator(this.locators.deleteButton).click();
      await this.waitForTimeout(2000);

      return activityTitle;
    }
    return null;
  }

  /**
   * Check if success message is visible
   * @returns {boolean} True if success message is visible
   */
  async isSuccessMessageVisible() {
    return await this.isVisible(this.locators.alertMessage);
  }

  /**
   * Get success message text
   * @returns {string} Success message text
   */
  async getSuccessMessage() {
    return await this.getTextContent(this.locators.alertMessage);
  }

  /**
   * Get details from first activity card
   * @returns {Object} Activity details
   */
  async getFirstActivityDetails() {
    const firstCard = this.page.locator(this.locators.activityCards).first();

    if (!(await firstCard.isVisible())) {
      return null;
    }

    return {
      hasTitle: await firstCard.locator(this.locators.activityTitle).isVisible(),
      hasType: await firstCard.locator(this.locators.activityType).isVisible(),
      hasStatusBadge: await firstCard.locator(this.locators.statusBadge).isVisible(),
      hasPriorityBadge: await firstCard.locator(this.locators.priorityBadge).isVisible(),
      hasCreatedDate: await firstCard.locator(this.locators.createdDate).isVisible(),
      hasActions: await firstCard.locator(this.locators.activityActions).isVisible(),
      hasDeleteButton: await firstCard.locator(this.locators.deleteButton).isVisible()
    };
  }

  /**
   * Check priority indicators
   * @returns {Object} Priority indicators status
   */
  async checkPriorityIndicators() {
    return {
      highPriorityCount: await this.getElementCount(this.locators.highPriorityCard),
      mediumPriorityCount: await this.getElementCount(this.locators.mediumPriorityCard),
      lowPriorityCount: await this.getElementCount(this.locators.lowPriorityCard)
    };
  }

  /**
   * Check if specific activity type appears in filtered results
   * @param {string} activityType - Activity type to check
   * @returns {boolean} True if activity type appears in results
   */
  async doesActivityTypeAppearInResults(activityType) {
    const activityCards = this.page.locator(this.locators.activityCards);
    const cardCount = await activityCards.count();

    if (cardCount > 0) {
      const firstCard = activityCards.first();
      const cardText = await firstCard.textContent();
      return cardText.toLowerCase().includes(activityType.toLowerCase().replace('-', ' '));
    }

    return false;
  }

  /**
   * Check if completed status appears in filtered results
   * @returns {boolean} True if completed status appears in results
   */
  async doesCompletedStatusAppearInResults() {
    const completedCards = this.page.locator(this.locators.completedActivity);
    return await completedCards.count() > 0;
  }

  /**
   * Check if pending activity has mark complete button
   * @returns {boolean} True if pending activity has mark complete button
   */
  async pendingActivityHasMarkCompleteButton() {
    const pendingActivity = this.page.locator(this.locators.pendingActivity).first();

    if (await pendingActivity.isVisible()) {
      return await pendingActivity.locator(this.locators.markCompleteButton).isVisible();
    }

    return false;
  }

  /**
   * Check if activity shows job reference
   * @returns {boolean} True if activity shows job reference
   */
  async doesActivityShowJobReference() {
    const firstCard = this.page.locator(this.locators.activityCards).first();

    if (await firstCard.isVisible()) {
      return await firstCard.locator(this.locators.jobReference).isVisible();
    }

    return false;
  }

  /**
   * Check if activity dates are displayed correctly
   * @returns {Object} Date display status
   */
  async checkActivityDates() {
    const firstCard = this.page.locator(this.locators.activityCards).first();

    if (!(await firstCard.isVisible())) {
      return { hasCreatedDate: false, hasScheduledDate: false, hasCompletedDate: false };
    }

    return {
      hasCreatedDate: await firstCard.locator(this.locators.createdDate).isVisible(),
      hasScheduledDate: await firstCard.locator(this.locators.scheduledDate).isVisible(),
      hasCompletedDate: await firstCard.locator(this.locators.completedDate).isVisible()
    };
  }

  /**
   * Check if activities count is displayed
   * @returns {boolean} True if activities count is visible
   */
  async isActivitiesCountVisible() {
    return await this.isVisible(this.locators.activitiesCount);
  }

  /**
   * Get activities count text
   * @returns {string} Activities count text
   */
  async getActivitiesCountText() {
    if (await this.isActivitiesCountVisible()) {
      return await this.getTextContent(this.locators.activitiesCount);
    }
    return '';
  }

  /**
   * Check empty state message
   * @returns {boolean} True if empty state shows correct message
   */
  async isEmptyStateCorrect() {
    if (await this.isVisible(this.locators.noActivities)) {
      const title = await this.getTextContent(this.locators.noActivitiesTitle);
      return title.includes('No activities found');
    }
    return false;
  }

  /**
   * Apply filters that might result in empty state
   */
  async applyFiltersForEmptyState() {
    await this.filterByType('offer-received');
    await this.filterByStatus('completed');
  }

  /**
   * Wait for activities page to load
   */
  async waitForActivitiesLoad() {
    await this.waitForElement(this.locators.pageTitle, 5000);

    // Wait for either activities container or filter options to be visible
    try {
      await this.waitForElement(this.locators.activitiesContainer, 3000);
    } catch {
      await this.waitForElement(this.locators.activityTypeFilter, 3000);
    }
  }

  /**
   * Verify activities page is properly loaded
   * @returns {Object} Verification results
   */
  async verifyActivitiesPageLoaded() {
    return {
      isOnCorrectUrl: await this.isOnActivitiesPage(),
      hasPageTitle: await this.isVisible(this.locators.pageTitle),
      hasFilters: await this.areFiltersVisible(),
      activitiesState: await this.getActivitiesState()
    };
  }
}

module.exports = ActivitiesPage;
