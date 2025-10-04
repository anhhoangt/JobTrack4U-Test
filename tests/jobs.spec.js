/**
 * =====================================================
 * JOB MANAGEMENT TESTS
 * =====================================================
 *
 * This test suite covers all job-related functionality:
 * - Creating new jobs
 * - Viewing job listings
 * - Editing existing jobs
 * - Deleting jobs
 * - Job search and filtering
 * - Job status updates
 * - Enhanced job fields (Phase 1 & 2)
 */

const { test, expect } = require('@playwright/test');

test.describe('Job Management', () => {
  // Setup: Login before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[name="email"]', 'test@jobtrack.com');
    await page.fill('input[name="password"]', 'testpassword123');
    await page.click('button[type="submit"]');

    // Wait for dashboard to load
    await expect(page).toHaveURL('/');
  });

  test('should create a new job successfully', async ({ page }) => {
    // Navigate to add job page
    await page.click('a[href="/add-job"], button:has-text("Add Job")');
    await expect(page).toHaveURL('/add-job');

    // Fill basic job information
    await page.fill('input[name="position"]', 'Senior Software Engineer');
    await page.fill('input[name="company"]', 'TechCorp Inc');
    await page.fill('input[name="jobLocation"]', 'San Francisco, CA');

    // Select job type
    await page.selectOption('select[name="jobType"]', 'full-time');

    // Select status
    await page.selectOption('select[name="status"]', 'pending');

    // Fill enhanced fields (Phase 1)
    await page.fill('input[name="salaryMin"]', '120000');
    await page.fill('input[name="salaryMax"]', '180000');
    await page.selectOption('select[name="salaryCurrency"]', 'USD');

    // Fill job description
    await page.fill('textarea[name="jobDescription"]', 'Exciting opportunity to work with cutting-edge technologies in AI and machine learning.');

    // Fill company website
    await page.fill('input[name="companyWebsite"]', 'https://techcorp.com');

    // Fill job posting URL
    await page.fill('input[name="jobPostingUrl"]', 'https://techcorp.com/careers/senior-software-engineer');

    // Select application method
    await page.selectOption('select[name="applicationMethod"]', 'website');

    // Fill notes
    await page.fill('textarea[name="notes"]', 'Found this job through LinkedIn. Looks like a great fit for my skills.');

    // Phase 2 fields
    await page.selectOption('select[name="category"]', 'software-engineering');
    await page.fill('input[name="tags"]', 'javascript, react, node.js, remote-friendly');
    await page.selectOption('select[name="priority"]', 'high');

    // Submit the form
    await page.click('button[type="submit"]');

    // Should show success message
    await expect(page.locator('[class*="alert"], .success')).toContainText('Job Created', { timeout: 5000 });

    // Should clear the form after successful creation
    await expect(page.locator('input[name="position"]')).toHaveValue('');
  });

  test('should display jobs in the job listing', async ({ page }) => {
    // Navigate to all jobs page
    await page.click('a[href="/all-jobs"], button:has-text("All Jobs")');
    await expect(page).toHaveURL('/all-jobs');

    // Should show job listing
    await expect(page.locator('h2, h3')).toContainText(['Jobs', 'All Jobs']);

    // Should show search and filter options
    await expect(page.locator('input[name="search"], select[name="searchStatus"]')).toBeVisible();

    // If there are jobs, should show job cards
    const jobCards = page.locator('[class*="job"], .job-card, article');
    const jobCount = await jobCards.count();

    if (jobCount > 0) {
      // Should show job information
      await expect(jobCards.first()).toContainText(['position', 'company', 'location']);
    }
  });

  test('should search jobs by position and company', async ({ page }) => {
    // First create a test job
    await page.click('a[href="/add-job"]');
    await page.fill('input[name="position"]', 'Frontend Developer');
    await page.fill('input[name="company"]', 'SearchTest Corp');
    await page.fill('input[name="jobLocation"]', 'New York, NY');
    await page.click('button[type="submit"]');

    // Navigate to all jobs
    await page.click('a[href="/all-jobs"]');

    // Search for the created job
    await page.fill('input[name="search"]', 'Frontend');
    await page.waitForTimeout(1000); // Wait for search to trigger

    // Should show filtered results
    await expect(page.locator('[class*="job"], .job-card')).toContainText('Frontend Developer');

    // Test company search
    await page.fill('input[name="search"]', 'SearchTest');
    await page.waitForTimeout(1000);

    // Should show the same job
    await expect(page.locator('[class*="job"], .job-card')).toContainText('SearchTest Corp');
  });

  test('should filter jobs by status', async ({ page }) => {
    // Navigate to all jobs
    await page.click('a[href="/all-jobs"]');

    // Filter by interview status
    await page.selectOption('select[name="searchStatus"]', 'interview');
    await page.waitForTimeout(1000);

    // Should show only interview jobs or no jobs message
    const jobCards = page.locator('[class*="job"], .job-card');
    const jobCount = await jobCards.count();

    if (jobCount > 0) {
      // All visible jobs should have interview status
      await expect(jobCards.first().locator('[class*="status"]')).toContainText('interview');
    }
  });

  test('should filter jobs by type', async ({ page }) => {
    // Navigate to all jobs
    await page.click('a[href="/all-jobs"]');

    // Filter by remote jobs
    await page.selectOption('select[name="searchType"]', 'remote');
    await page.waitForTimeout(1000);

    // Should filter results accordingly
    const jobCards = page.locator('[class*="job"], .job-card');
    const jobCount = await jobCards.count();

    if (jobCount > 0) {
      // All visible jobs should be remote type
      await expect(jobCards.first()).toContainText('remote');
    }
  });

  test('should edit an existing job', async ({ page }) => {
    // First create a job to edit
    await page.click('a[href="/add-job"]');
    await page.fill('input[name="position"]', 'Backend Developer');
    await page.fill('input[name="company"]', 'EditTest Inc');
    await page.fill('input[name="jobLocation"]', 'Austin, TX');
    await page.click('button[type="submit"]');

    // Navigate to all jobs
    await page.click('a[href="/all-jobs"]');

    // Find and click edit button for the created job
    const editButton = page.locator('button:has-text("Edit"), a:has-text("Edit")').first();
    await editButton.click();

    // Should navigate to add-job page in edit mode
    await expect(page).toHaveURL('/add-job');

    // Form should be pre-filled with job data
    await expect(page.locator('input[name="position"]')).toHaveValue('Backend Developer');
    await expect(page.locator('input[name="company"]')).toHaveValue('EditTest Inc');

    // Update the job
    await page.fill('input[name="position"]', 'Senior Backend Developer');
    await page.selectOption('select[name="status"]', 'interview');

    // Submit the update
    await page.click('button[type="submit"]');

    // Should show success message
    await expect(page.locator('[class*="alert"], .success')).toContainText('Job Updated', { timeout: 5000 });
  });

  test('should delete a job', async ({ page }) => {
    // First create a job to delete
    await page.click('a[href="/add-job"]');
    await page.fill('input[name="position"]', 'QA Engineer');
    await page.fill('input[name="company"]', 'DeleteTest LLC');
    await page.fill('input[name="jobLocation"]', 'Seattle, WA');
    await page.click('button[type="submit"]');

    // Navigate to all jobs
    await page.click('a[href="/all-jobs"]');

    // Find the job to delete
    const jobCard = page.locator('[class*="job"], .job-card').filter({ hasText: 'DeleteTest LLC' }).first();

    // Click delete button
    const deleteButton = jobCard.locator('button:has-text("Delete")');
    await deleteButton.click();

    // Should show confirmation or delete immediately
    // Handle potential confirmation dialog
    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    // Wait for deletion to complete
    await page.waitForTimeout(2000);

    // Job should no longer be visible
    await expect(page.locator('[class*="job"], .job-card').filter({ hasText: 'DeleteTest LLC' })).not.toBeVisible();
  });

  test('should sort jobs by different criteria', async ({ page }) => {
    // Navigate to all jobs
    await page.click('a[href="/all-jobs"]');

    // Test sorting by latest (default)
    await page.selectOption('select[name="sort"]', 'latest');
    await page.waitForTimeout(1000);

    // Test sorting alphabetically
    await page.selectOption('select[name="sort"]', 'a-z');
    await page.waitForTimeout(1000);

    // Test sorting by oldest
    await page.selectOption('select[name="sort"]', 'oldest');
    await page.waitForTimeout(1000);

    // Should show jobs in different order (hard to test exact order without knowing data)
    await expect(page.locator('[class*="job"], .job-card')).toBeVisible();
  });

  test('should clear all filters', async ({ page }) => {
    // Navigate to all jobs
    await page.click('a[href="/all-jobs"]');

    // Apply some filters
    await page.fill('input[name="search"]', 'Developer');
    await page.selectOption('select[name="searchStatus"]', 'interview');
    await page.selectOption('select[name="searchType"]', 'remote');

    // Click clear filters button
    await page.click('button:has-text("Clear Filters"), button:has-text("Clear")');

    // All filters should be reset
    await expect(page.locator('input[name="search"]')).toHaveValue('');
    await expect(page.locator('select[name="searchStatus"]')).toHaveValue('all');
    await expect(page.locator('select[name="searchType"]')).toHaveValue('all');
  });

  test('should validate required fields when creating job', async ({ page }) => {
    // Navigate to add job page
    await page.click('a[href="/add-job"]');

    // Try to submit without required fields
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('[class*="alert"], .error')).toBeVisible({ timeout: 5000 });

    // Should stay on the same page
    await expect(page).toHaveURL('/add-job');
  });

  test('should show job statistics on dashboard', async ({ page }) => {
    // Should be on dashboard
    await expect(page).toHaveURL('/');

    // Should show stats containers
    await expect(page.locator('[class*="stats"], .stat-card, .statistic')).toBeVisible();

    // Should show different job status counts
    await expect(page.locator('text=/pending|interview|declined/i')).toBeVisible();
  });

  test('should display enhanced job fields in job cards', async ({ page }) => {
    // Create a job with enhanced fields
    await page.click('a[href="/add-job"]');
    await page.fill('input[name="position"]', 'Data Scientist');
    await page.fill('input[name="company"]', 'DataCorp');
    await page.fill('input[name="jobLocation"]', 'Boston, MA');
    await page.fill('input[name="salaryMin"]', '100000');
    await page.fill('input[name="salaryMax"]', '150000');
    await page.fill('input[name="jobPostingUrl"]', 'https://datacorp.com/jobs/data-scientist');
    await page.selectOption('select[name="priority"]', 'high');
    await page.click('button[type="submit"]');

    // Navigate to all jobs
    await page.click('a[href="/all-jobs"]');

    // Should show enhanced fields in job card
    const jobCard = page.locator('[class*="job"], .job-card').filter({ hasText: 'DataCorp' }).first();

    // Should show salary information
    await expect(jobCard).toContainText('100,000');

    // Should show priority indicator
    await expect(jobCard.locator('[class*="priority"], .priority-high')).toContainText('HIGH');

    // Should show job posting link
    await expect(jobCard.locator('a[href*="datacorp.com"]')).toBeVisible();
  });

  test('should filter by category (Phase 2)', async ({ page }) => {
    // Navigate to all jobs
    await page.click('a[href="/all-jobs"]');

    // Filter by software engineering category
    await page.selectOption('select[name="searchCategory"]', 'software-engineering');
    await page.waitForTimeout(1000);

    // Should filter results by category
    const jobCards = page.locator('[class*="job"], .job-card');
    const jobCount = await jobCards.count();

    if (jobCount > 0) {
      // Should show jobs in the selected category
      await expect(jobCards.first()).toContainText(/software|engineering/i);
    }
  });

  test('should filter by priority (Phase 2)', async ({ page }) => {
    // Navigate to all jobs
    await page.click('a[href="/all-jobs"]');

    // Filter by high priority
    await page.selectOption('select[name="searchPriority"]', 'high');
    await page.waitForTimeout(1000);

    // Should show only high priority jobs
    const jobCards = page.locator('[class*="job"], .job-card');
    const jobCount = await jobCards.count();

    if (jobCount > 0) {
      // Should show high priority indicator
      await expect(jobCards.first().locator('[class*="priority"]')).toContainText('HIGH');
    }
  });
});
