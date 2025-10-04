/**
 * =====================================================
 * JOBS PAGE OBJECT
 * =====================================================
 *
 * Page object for all jobs listing and job management functionality
 */

const BasePage = require('./BasePage');

class JobsPage extends BasePage {
  constructor(page) {
    super(page);

    // Locators
    this.locators = {
      // Page elements
      pageTitle: 'h2, h3',

      // Search and filters
      searchInput: 'input[name="search"]',
      statusFilter: 'select[name="searchStatus"]',
      typeFilter: 'select[name="searchType"]',
      categoryFilter: 'select[name="searchCategory"]',
      priorityFilter: 'select[name="searchPriority"]',
      sortSelect: 'select[name="sort"]',
      clearFiltersButton: 'button:has-text("Clear Filters"), button:has-text("Clear")',

      // Job cards/items
      jobCards: '[class*="job"], .job-card, article',
      jobCard: (companyName) => `[class*="job"], .job-card`.filter({ hasText: companyName }),

      // Job card elements
      jobPosition: '.position, [class*="position"]',
      jobCompany: '.company, [class*="company"]',
      jobLocation: '.location, [class*="location"]',
      jobStatus: '[class*="status"]',
      jobSalary: '[class*="salary"]',
      jobPriority: '[class*="priority"], .priority-high, .priority-medium, .priority-low',
      jobPostingLink: 'a[href*="http"]',

      // Job actions
      editButton: 'button:has-text("Edit"), a:has-text("Edit")',
      deleteButton: 'button:has-text("Delete")',

      // Job details in cards
      jobDetails: {
        position: '[class*="position"], .job-title',
        company: '[class*="company"], .company-name',
        location: '[class*="location"], .job-location',
        status: '[class*="status"], .job-status',
        type: '[class*="type"], .job-type',
        salary: '[class*="salary"], .salary-range',
        priority: '[class*="priority"], .priority-badge',
        postingUrl: 'a[href*="http"], .posting-link'
      }
    };
  }

  /**
   * Navigate to all jobs page
   */
  async navigateToJobs() {
    await this.navigate('/all-jobs');
    await this.waitForUrl('/all-jobs');
  }

  /**
   * Check if on jobs page
   * @returns {boolean} True if on jobs page
   */
  async isOnJobsPage() {
    return this.page.url().includes('/all-jobs');
  }

  /**
   * Get page title
   * @returns {string} Page title text
   */
  async getPageTitle() {
    return await this.getTextContent(this.locators.pageTitle);
  }

  /**
   * Search for jobs
   * @param {string} searchTerm - Search term
   */
  async searchJobs(searchTerm) {
    await this.fillInput(this.locators.searchInput, searchTerm);
    await this.waitForTimeout(1000); // Wait for search to trigger
  }

  /**
   * Filter jobs by status
   * @param {string} status - Job status to filter by
   */
  async filterByStatus(status) {
    await this.selectOption(this.locators.statusFilter, status);
    await this.waitForTimeout(1000);
  }

  /**
   * Filter jobs by type
   * @param {string} type - Job type to filter by
   */
  async filterByType(type) {
    await this.selectOption(this.locators.typeFilter, type);
    await this.waitForTimeout(1000);
  }

  /**
   * Filter jobs by category
   * @param {string} category - Job category to filter by
   */
  async filterByCategory(category) {
    await this.selectOption(this.locators.categoryFilter, category);
    await this.waitForTimeout(1000);
  }

  /**
   * Filter jobs by priority
   * @param {string} priority - Job priority to filter by
   */
  async filterByPriority(priority) {
    await this.selectOption(this.locators.priorityFilter, priority);
    await this.waitForTimeout(1000);
  }

  /**
   * Sort jobs
   * @param {string} sortOption - Sort option (latest, oldest, a-z)
   */
  async sortJobs(sortOption) {
    await this.selectOption(this.locators.sortSelect, sortOption);
    await this.waitForTimeout(1000);
  }

  /**
   * Clear all filters
   */
  async clearFilters() {
    await this.clickElement(this.locators.clearFiltersButton);
  }

  /**
   * Get job cards count
   * @returns {number} Number of job cards
   */
  async getJobCardsCount() {
    return await this.getElementCount(this.locators.jobCards);
  }

  /**
   * Get job card by company name
   * @param {string} companyName - Company name to find
   * @returns {Locator} Job card locator
   */
  getJobCardByCompany(companyName) {
    return this.page.locator(this.locators.jobCards).filter({ hasText: companyName });
  }

  /**
   * Get job details from first job card
   * @returns {Object} Job details object
   */
  async getFirstJobDetails() {
    const firstCard = this.page.locator(this.locators.jobCards).first();

    if (!(await firstCard.isVisible())) {
      return null;
    }

    return {
      position: await this.getJobCardDetail(firstCard, 'position'),
      company: await this.getJobCardDetail(firstCard, 'company'),
      location: await this.getJobCardDetail(firstCard, 'location'),
      status: await this.getJobCardDetail(firstCard, 'status'),
      salary: await this.getJobCardDetail(firstCard, 'salary'),
      priority: await this.getJobCardDetail(firstCard, 'priority')
    };
  }

  /**
   * Get specific detail from job card
   * @param {Locator} jobCard - Job card locator
   * @param {string} detailType - Type of detail to get
   * @returns {string} Detail text or empty string
   */
  async getJobCardDetail(jobCard, detailType) {
    const selector = this.locators.jobDetails[detailType];
    const element = jobCard.locator(selector);

    if (await element.isVisible()) {
      return await element.textContent();
    }
    return '';
  }

  /**
   * Check if job card contains text
   * @param {string} text - Text to check for
   * @returns {boolean} True if job card contains text
   */
  async jobCardContainsText(text) {
    const jobCard = this.page.locator(this.locators.jobCards).filter({ hasText: text });
    return await jobCard.isVisible();
  }

  /**
   * Edit job by company name
   * @param {string} companyName - Company name of job to edit
   */
  async editJobByCompany(companyName) {
    const jobCard = this.getJobCardByCompany(companyName);
    await jobCard.locator(this.locators.editButton).first().click();
    await this.waitForUrl('/add-job');
  }

  /**
   * Delete job by company name
   * @param {string} companyName - Company name of job to delete
   */
  async deleteJobByCompany(companyName) {
    const jobCard = this.getJobCardByCompany(companyName);

    // Set up dialog handler for confirmation
    this.setupDialogHandler(true);

    await jobCard.locator(this.locators.deleteButton).click();
    await this.waitForTimeout(2000); // Wait for deletion to complete
  }

  /**
   * Check if search and filter options are visible
   * @returns {boolean} True if search and filters are visible
   */
  async areSearchFiltersVisible() {
    return await this.isVisible(this.locators.searchInput) &&
           await this.isVisible(this.locators.statusFilter);
  }

  /**
   * Check if job contains specific information
   * @param {string} companyName - Company name to find
   * @param {Object} expectedInfo - Expected job information
   * @returns {boolean} True if job contains expected info
   */
  async jobContainsInfo(companyName, expectedInfo) {
    const jobCard = this.getJobCardByCompany(companyName);

    if (!(await jobCard.isVisible())) {
      return false;
    }

    // Check each expected piece of information
    for (const [key, value] of Object.entries(expectedInfo)) {
      if (value && !(await jobCard.getByText(value).isVisible())) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get current filter values
   * @returns {Object} Current filter values
   */
  async getCurrentFilters() {
    return {
      search: await this.page.locator(this.locators.searchInput).inputValue(),
      status: await this.page.locator(this.locators.statusFilter).inputValue(),
      type: await this.page.locator(this.locators.typeFilter).inputValue(),
      category: await this.page.locator(this.locators.categoryFilter).inputValue(),
      priority: await this.page.locator(this.locators.priorityFilter).inputValue(),
      sort: await this.page.locator(this.locators.sortSelect).inputValue()
    };
  }

  /**
   * Check if enhanced job fields are displayed
   * @param {string} companyName - Company name to check
   * @returns {Object} Object with enhanced fields visibility
   */
  async checkEnhancedFields(companyName) {
    const jobCard = this.getJobCardByCompany(companyName);

    return {
      hasSalary: await jobCard.locator(this.locators.jobSalary).isVisible(),
      hasPriority: await jobCard.locator(this.locators.jobPriority).isVisible(),
      hasPostingLink: await jobCard.locator(this.locators.jobPostingLink).isVisible()
    };
  }

  /**
   * Apply multiple filters
   * @param {Object} filters - Filters to apply
   */
  async applyFilters(filters) {
    if (filters.search) {
      await this.searchJobs(filters.search);
    }

    if (filters.status) {
      await this.filterByStatus(filters.status);
    }

    if (filters.type) {
      await this.filterByType(filters.type);
    }

    if (filters.category) {
      await this.filterByCategory(filters.category);
    }

    if (filters.priority) {
      await this.filterByPriority(filters.priority);
    }

    if (filters.sort) {
      await this.sortJobs(filters.sort);
    }
  }

  /**
   * Wait for jobs to load
   */
  async waitForJobsLoad() {
    // Wait for either job cards or page title to be visible
    try {
      await this.waitForElement(this.locators.jobCards, 3000);
    } catch {
      await this.waitForElement(this.locators.pageTitle, 3000);
    }
  }

  /**
   * Verify jobs page is properly loaded
   * @returns {Object} Verification results
   */
  async verifyJobsPageLoaded() {
    return {
      isOnCorrectUrl: await this.isOnJobsPage(),
      hasPageTitle: await this.isVisible(this.locators.pageTitle),
      hasSearchFilters: await this.areSearchFiltersVisible(),
      jobCount: await this.getJobCardsCount()
    };
  }
}

module.exports = JobsPage;
