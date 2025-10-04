/**
 * =====================================================
 * ADD JOB PAGE OBJECT
 * =====================================================
 *
 * Page object for add/edit job functionality
 */

const BasePage = require('./BasePage');

class AddJobPage extends BasePage {
  constructor(page) {
    super(page);

    // Locators
    this.locators = {
      // Page elements
      pageTitle: 'h3',

      // Basic job form fields
      positionInput: 'input[name="position"]',
      companyInput: 'input[name="company"]',
      jobLocationInput: 'input[name="jobLocation"]',
      jobTypeSelect: 'select[name="jobType"]',
      statusSelect: 'select[name="status"]',

      // Enhanced fields (Phase 1)
      salaryMinInput: '.form-input[name="salaryMin"]',
      salaryMaxInput: '.form-input[name="salaryMax"]',
      salaryCurrencySelect: 'select[name="salaryCurrency"]',
      jobDescriptionTextarea: '.form-textarea[name="jobDescription"]',
      companyWebsiteInput: '.form-input[name="companyWebsite"]',
      jobPostingUrlInput: '.form-input[name="jobPostingUrl"]',
      applicationMethodSelect: 'select[name="applicationMethod"]',
      notesTextarea: '.form-textarea[name="notes"]',

      // Phase 2 fields
      categorySelect: 'select[name="category"]',
      tagsInput: '.form-input[name="tags"]',
      prioritySelect: 'select[name="priority"]',

      // Form actions
      submitButton: '.submit-btn, button[type="submit"]',

      // Messages
      alertMessage: '[class*="alert"], .success, .error'
    };
  }

  /**
   * Navigate to add job page
   */
  async navigateToAddJob() {
    await this.navigate('/add-job');
    await this.waitForUrl('/add-job');
  }

  /**
   * Check if on add job page
   * @returns {boolean} True if on add job page
   */
  async isOnAddJobPage() {
    return this.page.url().includes('/add-job');
  }

  /**
   * Get page title
   * @returns {string} Page title text
   */
  async getPageTitle() {
    return await this.getTextContent(this.locators.pageTitle);
  }

  /**
   * Fill basic job information
   * @param {Object} jobData - Basic job data
   */
  async fillBasicJobInfo(jobData) {
    if (jobData.position) {
      await this.fillInput(this.locators.positionInput, jobData.position);
    }

    if (jobData.company) {
      await this.fillInput(this.locators.companyInput, jobData.company);
    }

    if (jobData.jobLocation) {
      await this.fillInput(this.locators.jobLocationInput, jobData.jobLocation);
    }

    if (jobData.jobType) {
      await this.selectOption(this.locators.jobTypeSelect, jobData.jobType);
    }

    if (jobData.status) {
      await this.selectOption(this.locators.statusSelect, jobData.status);
    }
  }

  /**
   * Fill enhanced job information (Phase 1)
   * @param {Object} enhancedData - Enhanced job data
   */
  async fillEnhancedJobInfo(enhancedData) {
    if (enhancedData.salaryMin) {
      await this.fillInput(this.locators.salaryMinInput, enhancedData.salaryMin);
    }

    if (enhancedData.salaryMax) {
      await this.fillInput(this.locators.salaryMaxInput, enhancedData.salaryMax);
    }

    if (enhancedData.salaryCurrency) {
      await this.selectOption(this.locators.salaryCurrencySelect, enhancedData.salaryCurrency);
    }

    if (enhancedData.jobDescription) {
      await this.fillInput(this.locators.jobDescriptionTextarea, enhancedData.jobDescription);
    }

    if (enhancedData.companyWebsite) {
      await this.fillInput(this.locators.companyWebsiteInput, enhancedData.companyWebsite);
    }

    if (enhancedData.jobPostingUrl) {
      await this.fillInput(this.locators.jobPostingUrlInput, enhancedData.jobPostingUrl);
    }

    if (enhancedData.applicationMethod) {
      await this.selectOption(this.locators.applicationMethodSelect, enhancedData.applicationMethod);
    }

    if (enhancedData.notes) {
      await this.fillInput(this.locators.notesTextarea, enhancedData.notes);
    }
  }

  /**
   * Fill Phase 2 job information
   * @param {Object} phase2Data - Phase 2 job data
   */
  async fillPhase2JobInfo(phase2Data) {
    if (phase2Data.category) {
      await this.selectOption(this.locators.categorySelect, phase2Data.category);
    }

    if (phase2Data.tags) {
      await this.fillInput(this.locators.tagsInput, phase2Data.tags);
    }

    if (phase2Data.priority) {
      await this.selectOption(this.locators.prioritySelect, phase2Data.priority);
    }
  }

  /**
   * Fill complete job form
   * @param {Object} jobData - Complete job data object
   */
  async fillCompleteJobForm(jobData) {
    // Fill basic information
    await this.fillBasicJobInfo(jobData);

    // Fill enhanced information if provided
    if (jobData.enhanced) {
      await this.fillEnhancedJobInfo(jobData.enhanced);
    }

    // Fill Phase 2 information if provided
    if (jobData.phase2) {
      await this.fillPhase2JobInfo(jobData.phase2);
    }
  }

  /**
   * Submit the job form
   */
  async submitForm() {
    await this.clickElement(this.locators.submitButton);
  }

  /**
   * Create a new job with all fields
   * @param {Object} jobData - Job data object
   */
  async createJob(jobData) {
    await this.fillCompleteJobForm(jobData);
    await this.submitForm();
  }

  /**
   * Check if success message is visible
   * @returns {boolean} True if success message is visible
   */
  async isSuccessMessageVisible() {
    return await this.isVisible(this.locators.alertMessage);
  }

  /**
   * Get alert message text
   * @returns {string} Alert message text
   */
  async getAlertMessage() {
    return await this.getTextContent(this.locators.alertMessage);
  }

  /**
   * Check if form fields are empty (after successful creation)
   * @returns {boolean} True if position field is empty
   */
  async isFormCleared() {
    const positionValue = await this.page.locator(this.locators.positionInput).inputValue();
    return positionValue === '';
  }

  /**
   * Get current form values
   * @returns {Object} Current form values
   */
  async getFormValues() {
    return {
      position: await this.page.locator(this.locators.positionInput).inputValue(),
      company: await this.page.locator(this.locators.companyInput).inputValue(),
      jobLocation: await this.page.locator(this.locators.jobLocationInput).inputValue(),
      jobType: await this.page.locator(this.locators.jobTypeSelect).inputValue(),
      status: await this.page.locator(this.locators.statusSelect).inputValue(),
      salaryMin: await this.page.locator(this.locators.salaryMinInput).inputValue(),
      salaryMax: await this.page.locator(this.locators.salaryMaxInput).inputValue(),
      category: await this.page.locator(this.locators.categorySelect).inputValue(),
      priority: await this.page.locator(this.locators.prioritySelect).inputValue()
    };
  }

  /**
   * Check if form is pre-filled (edit mode)
   * @param {Object} expectedData - Expected form data
   * @returns {boolean} True if form is pre-filled with expected data
   */
  async isFormPreFilled(expectedData) {
    const currentValues = await this.getFormValues();

    return currentValues.position === expectedData.position &&
           currentValues.company === expectedData.company;
  }

  /**
   * Update existing job (edit mode)
   * @param {Object} updates - Updated job data
   */
  async updateJob(updates) {
    // Clear and fill updated fields
    if (updates.position) {
      await this.page.locator(this.locators.positionInput).fill('');
      await this.fillInput(this.locators.positionInput, updates.position);
    }

    if (updates.status) {
      await this.selectOption(this.locators.statusSelect, updates.status);
    }

    if (updates.priority) {
      await this.selectOption(this.locators.prioritySelect, updates.priority);
    }

    await this.submitForm();
  }

  /**
   * Create test job with default values
   * @param {Object} overrides - Override default values
   */
  async createTestJob(overrides = {}) {
    const defaultJobData = {
      position: 'Test Software Engineer',
      company: 'Test Company Inc',
      jobLocation: 'Remote',
      jobType: 'full-time',
      status: 'pending',
      enhanced: {
        salaryMin: '80000',
        salaryMax: '120000',
        salaryCurrency: 'USD',
        jobDescription: 'Test job description',
        companyWebsite: 'https://testcompany.com',
        jobPostingUrl: 'https://testcompany.com/careers/engineer',
        applicationMethod: 'website',
        notes: 'Test notes'
      },
      phase2: {
        category: 'software-engineering',
        tags: 'javascript, react, node.js',
        priority: 'medium'
      },
      ...overrides
    };

    await this.createJob(defaultJobData);
  }

  /**
   * Check if all form fields are visible
   * @returns {Object} Visibility status of form sections
   */
  async checkFormFieldsVisibility() {
    return {
      basicFields: {
        position: await this.isVisible(this.locators.positionInput),
        company: await this.isVisible(this.locators.companyInput),
        location: await this.isVisible(this.locators.jobLocationInput),
        type: await this.isVisible(this.locators.jobTypeSelect),
        status: await this.isVisible(this.locators.statusSelect)
      },
      enhancedFields: {
        salaryMin: await this.isVisible(this.locators.salaryMinInput),
        salaryMax: await this.isVisible(this.locators.salaryMaxInput),
        description: await this.isVisible(this.locators.jobDescriptionTextarea),
        website: await this.isVisible(this.locators.companyWebsiteInput),
        postingUrl: await this.isVisible(this.locators.jobPostingUrlInput)
      },
      phase2Fields: {
        category: await this.isVisible(this.locators.categorySelect),
        tags: await this.isVisible(this.locators.tagsInput),
        priority: await this.isVisible(this.locators.prioritySelect)
      }
    };
  }

  /**
   * Submit form without filling required fields (for validation testing)
   */
  async submitEmptyForm() {
    await this.submitForm();
  }

  /**
   * Wait for form to load
   */
  async waitForFormLoad() {
    await this.waitForElement(this.locators.positionInput, 5000);
    await this.waitForElement(this.locators.submitButton, 5000);
  }

  /**
   * Verify add job page is properly loaded
   * @returns {Object} Verification results
   */
  async verifyAddJobPageLoaded() {
    return {
      isOnCorrectUrl: await this.isOnAddJobPage(),
      hasPageTitle: await this.isVisible(this.locators.pageTitle),
      hasPositionField: await this.isVisible(this.locators.positionInput),
      hasSubmitButton: await this.isVisible(this.locators.submitButton)
    };
  }
}

module.exports = AddJobPage;
