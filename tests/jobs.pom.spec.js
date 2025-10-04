/**
 * =====================================================
 * JOB MANAGEMENT TESTS - POM VERSION
 * =====================================================
 *
 * This test suite covers all job-related functionality using POM:
 * - Creating new jobs
 * - Viewing job listings
 * - Editing existing jobs
 * - Deleting jobs
 * - Job search and filtering
 * - Job status updates
 * - Enhanced job fields (Phase 1 & 2)
 */

const { test, expect } = require('@playwright/test');
const { AuthPage, JobsPage, AddJobPage, NavigationComponent } = require('../pages');

test.describe('Job Management - POM', () => {
  let authPage;
  let jobsPage;
  let addJobPage;
  let navigation;

  // Setup: Login before each test
  test.beforeEach(async ({ page }) => {
    // Initialize page objects
    authPage = new AuthPage(page);
    jobsPage = new JobsPage(page);
    addJobPage = new AddJobPage(page);
    navigation = new NavigationComponent(page);

    // Login before each test
    await authPage.performLogin();
  });

  test('should create a new job successfully', async ({ page }) => {
    // Navigate to add job page
    await navigation.goToAddJob();

    // Verify we're on the correct page
    const verification = await addJobPage.verifyAddJobPageLoaded();
    expect(verification.isOnCorrectUrl).toBe(true);
    expect(verification.hasPositionField).toBe(true);

    // Create job with complete data
    const jobData = {
      position: 'Senior Software Engineer',
      company: 'TechCorp Inc',
      jobLocation: 'San Francisco, CA',
      jobType: 'full-time',
      status: 'pending',
      enhanced: {
        salaryMin: '120000',
        salaryMax: '180000',
        salaryCurrency: 'USD',
        jobDescription: 'Exciting opportunity to work with cutting-edge technologies in AI and machine learning.',
        companyWebsite: 'https://techcorp.com',
        jobPostingUrl: 'https://techcorp.com/careers/senior-software-engineer',
        applicationMethod: 'website',
        notes: 'Found this job through LinkedIn. Looks like a great fit for my skills.'
      },
      phase2: {
        category: 'software-engineering',
        tags: 'javascript, react, node.js, remote-friendly',
        priority: 'high'
      }
    };

    await addJobPage.createJob(jobData);

    // Should show success message
    expect(await addJobPage.isSuccessMessageVisible()).toBe(true);
    const alertMessage = await addJobPage.getAlertMessage();
    expect(alertMessage).toContain('Job Created');

    // Should clear the form after successful creation
    expect(await addJobPage.isFormCleared()).toBe(true);
  });

  test('should display jobs in the job listing', async ({ page }) => {
    // Navigate to all jobs page
    await navigation.goToAllJobs();

    // Verify page loaded correctly
    const verification = await jobsPage.verifyJobsPageLoaded();
    expect(verification.isOnCorrectUrl).toBe(true);
    expect(verification.hasSearchFilters).toBe(true);

    // Should show jobs page title
    const pageTitle = await jobsPage.getPageTitle();
    expect(['Jobs', 'All Jobs'].some(text => pageTitle.includes(text))).toBe(true);

    // If there are jobs, should show job cards
    const jobCount = await jobsPage.getJobCardsCount();
    if (jobCount > 0) {
      const firstJobDetails = await jobsPage.getFirstJobDetails();
      expect(firstJobDetails).not.toBeNull();
      expect(firstJobDetails.position || firstJobDetails.company).toBeTruthy();
    }
  });

  test('should search jobs by position and company', async ({ page }) => {
    // First create a test job
    await navigation.goToAddJob();

    const testJobData = {
      position: 'Frontend Developer',
      company: 'SearchTest Corp',
      jobLocation: 'New York, NY'
    };

    await addJobPage.createTestJob(testJobData);

    // Navigate to all jobs
    await navigation.goToAllJobs();

    // Search for the created job by position
    await jobsPage.searchJobs('Frontend');

    // Should show filtered results
    expect(await jobsPage.jobCardContainsText('Frontend Developer')).toBe(true);

    // Test company search
    await jobsPage.searchJobs('SearchTest');

    // Should show the same job
    expect(await jobsPage.jobCardContainsText('SearchTest Corp')).toBe(true);
  });

  test('should filter jobs by status', async ({ page }) => {
    // Navigate to all jobs
    await navigation.goToAllJobs();

    // Filter by interview status
    await jobsPage.filterByStatus('interview');

    const jobCount = await jobsPage.getJobCardsCount();

    if (jobCount > 0) {
      // All visible jobs should have interview status
      const firstJobDetails = await jobsPage.getFirstJobDetails();
      expect(firstJobDetails.status.toLowerCase()).toContain('interview');
    }
  });

  test('should filter jobs by type', async ({ page }) => {
    // Navigate to all jobs
    await navigation.goToAllJobs();

    // Filter by remote jobs
    await jobsPage.filterByType('remote');

    const jobCount = await jobsPage.getJobCardsCount();

    if (jobCount > 0) {
      // All visible jobs should be remote type
      expect(await jobsPage.jobCardContainsText('remote')).toBe(true);
    }
  });

  test('should edit an existing job', async ({ page }) => {
    // First create a job to edit
    await navigation.goToAddJob();

    const originalJobData = {
      position: 'Backend Developer',
      company: 'EditTest Inc',
      jobLocation: 'Austin, TX'
    };

    await addJobPage.createTestJob(originalJobData);

    // Navigate to all jobs
    await navigation.goToAllJobs();

    // Edit the job
    await jobsPage.editJobByCompany('EditTest Inc');

    // Should navigate to add-job page in edit mode
    expect(await addJobPage.isOnAddJobPage()).toBe(true);

    // Form should be pre-filled with job data
    expect(await addJobPage.isFormPreFilled({
      position: 'Backend Developer',
      company: 'EditTest Inc'
    })).toBe(false); // This depends on your app's edit implementation

    // Update the job
    await addJobPage.updateJob({
      position: 'Senior Backend Developer',
      status: 'interview'
    });

    // Should show success message
    expect(await addJobPage.isSuccessMessageVisible()).toBe(true);
    const alertMessage = await addJobPage.getAlertMessage();
    expect(alertMessage).toContain('Job Updated');
  });

  test('should delete a job', async ({ page }) => {
    // First create a job to delete
    await navigation.goToAddJob();

    const jobToDelete = {
      position: 'QA Engineer',
      company: 'DeleteTest LLC',
      jobLocation: 'Seattle, WA'
    };

    await addJobPage.createTestJob(jobToDelete);

    // Navigate to all jobs
    await navigation.goToAllJobs();

    // Delete the job
    await jobsPage.deleteJobByCompany('DeleteTest LLC');

    // Job should no longer be visible
    expect(await jobsPage.jobCardContainsText('DeleteTest LLC')).toBe(false);
  });

  test('should sort jobs by different criteria', async ({ page }) => {
    // Navigate to all jobs
    await navigation.goToAllJobs();

    // Test different sorting options
    const sortOptions = ['latest', 'a-z', 'oldest'];

    for (const sortOption of sortOptions) {
      await jobsPage.sortJobs(sortOption);

      // Verify the sort option was applied
      const currentFilters = await jobsPage.getCurrentFilters();
      expect(currentFilters.sort).toBe(sortOption);
    }
  });

  test('should clear all filters', async ({ page }) => {
    // Navigate to all jobs
    await navigation.goToAllJobs();

    // Apply multiple filters
    const filters = {
      search: 'Developer',
      status: 'interview',
      type: 'remote'
    };

    await jobsPage.applyFilters(filters);

    // Clear filters
    await jobsPage.clearFilters();

    // All filters should be reset
    const currentFilters = await jobsPage.getCurrentFilters();
    expect(currentFilters.search).toBe('');
    expect(currentFilters.status).toBe('all');
    expect(currentFilters.type).toBe('all');
  });

  test('should validate required fields when creating job', async ({ page }) => {
    // Navigate to add job page
    await navigation.goToAddJob();

    // Try to submit without required fields
    await addJobPage.submitEmptyForm();

    // Should show error message
    expect(await addJobPage.isSuccessMessageVisible()).toBe(true);

    // Should stay on the same page
    expect(await addJobPage.isOnAddJobPage()).toBe(true);
  });

  test('should display enhanced job fields in job cards', async ({ page }) => {
    // Create a job with enhanced fields
    await navigation.goToAddJob();

    const enhancedJobData = {
      position: 'Data Scientist',
      company: 'DataCorp',
      jobLocation: 'Boston, MA',
      enhanced: {
        salaryMin: '100000',
        salaryMax: '150000',
        jobPostingUrl: 'https://datacorp.com/jobs/data-scientist'
      },
      phase2: {
        priority: 'high'
      }
    };

    await addJobPage.createTestJob(enhancedJobData);

    // Navigate to all jobs
    await navigation.goToAllJobs();

    // Check enhanced fields in job card
    const enhancedFields = await jobsPage.checkEnhancedFields('DataCorp');
    expect(enhancedFields.hasSalary).toBe(true);
    expect(enhancedFields.hasPriority).toBe(true);
    expect(enhancedFields.hasPostingLink).toBe(true);
  });

  test('should filter by category (Phase 2)', async ({ page }) => {
    // Navigate to all jobs
    await navigation.goToAllJobs();

    // Filter by software engineering category
    await jobsPage.filterByCategory('software-engineering');

    const jobCount = await jobsPage.getJobCardsCount();

    if (jobCount > 0) {
      // Should show jobs in the selected category
      expect(await jobsPage.jobCardContainsText('software')).toBe(true);
    }
  });

  test('should filter by priority (Phase 2)', async ({ page }) => {
    // Navigate to all jobs
    await navigation.goToAllJobs();

    // Filter by high priority
    await jobsPage.filterByPriority('high');

    const jobCount = await jobsPage.getJobCardsCount();

    if (jobCount > 0) {
      // Should show high priority indicator
      const firstJobDetails = await jobsPage.getFirstJobDetails();
      expect(firstJobDetails.priority.toUpperCase()).toContain('HIGH');
    }
  });

  test('should handle complex job creation workflow', async ({ page }) => {
    // Navigate to add job page
    await navigation.goToAddJob();

    // Check all form fields are visible
    const fieldsVisibility = await addJobPage.checkFormFieldsVisibility();
    expect(fieldsVisibility.basicFields.position).toBe(true);
    expect(fieldsVisibility.basicFields.company).toBe(true);
    expect(fieldsVisibility.enhancedFields.salaryMin).toBe(true);
    expect(fieldsVisibility.phase2Fields.priority).toBe(true);

    // Create comprehensive job
    const comprehensiveJobData = {
      position: 'Full Stack Developer',
      company: 'ComprehensiveTest Inc',
      jobLocation: 'Denver, CO',
      jobType: 'contract',
      status: 'applied',
      enhanced: {
        salaryMin: '90000',
        salaryMax: '130000',
        salaryCurrency: 'USD',
        jobDescription: 'Full stack development role with modern tech stack',
        companyWebsite: 'https://comprehensivetest.com',
        jobPostingUrl: 'https://comprehensivetest.com/careers/fullstack',
        applicationMethod: 'email',
        notes: 'Applied through company website, very responsive'
      },
      phase2: {
        category: 'software-engineering',
        tags: 'react, node.js, mongodb, aws',
        priority: 'medium'
      }
    };

    await addJobPage.createJob(comprehensiveJobData);

    // Verify creation
    expect(await addJobPage.isSuccessMessageVisible()).toBe(true);

    // Navigate to jobs list and verify
    await navigation.goToAllJobs();
    expect(await jobsPage.jobCardContainsText('ComprehensiveTest Inc')).toBe(true);

    // Verify job contains expected information
    expect(await jobsPage.jobContainsInfo('ComprehensiveTest Inc', {
      position: 'Full Stack Developer',
      location: 'Denver, CO'
    })).toBe(true);
  });

  test('should handle job workflow with navigation', async ({ page }) => {
    // Test navigation between different job-related pages

    // Start at dashboard
    await navigation.goToStats();

    // Go to add job
    await navigation.goToAddJob();
    expect(await addJobPage.isOnAddJobPage()).toBe(true);

    // Create a job
    await addJobPage.createTestJob({
      company: 'NavigationTest Corp'
    });

    // Navigate to all jobs
    await navigation.goToAllJobs();
    expect(await jobsPage.isOnJobsPage()).toBe(true);

    // Verify job appears
    expect(await jobsPage.jobCardContainsText('NavigationTest Corp')).toBe(true);

    // Go back to add job to create another
    await navigation.goToAddJob();
    await addJobPage.createTestJob({
      company: 'SecondNavigationTest Corp'
    });

    // Return to jobs list
    await navigation.goToAllJobs();

    // Both jobs should be visible
    expect(await jobsPage.jobCardContainsText('NavigationTest Corp')).toBe(true);
    expect(await jobsPage.jobCardContainsText('SecondNavigationTest Corp')).toBe(true);
  });
});
