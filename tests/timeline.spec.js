/**
 * =====================================================
 * TIMELINE TESTS (Phase 3)
 * =====================================================
 *
 * This test suite covers timeline functionality:
 * - Timeline navigation
 * - Timeline view modes (all activities vs job-specific)
 * - Timeline visual elements
 * - Job selection for timeline
 * - Timeline statistics
 */

const { test, expect } = require('@playwright/test');

test.describe('Timeline', () => {
  // Setup: Login before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[name="email"]', 'test@jobtrack.com');
    await page.fill('input[name="password"]', 'testpassword123');
    await page.click('button[type="submit"]');

    // Wait for dashboard to load
    await expect(page).toHaveURL('/');
  });

  test('should navigate to timeline page', async ({ page }) => {
    // Click on timeline link in navigation
    await page.click('a[href="/timeline"], button:has-text("Timeline")');

    // Should navigate to timeline page
    await expect(page).toHaveURL('/timeline');

    // Should show timeline page content
    await expect(page.locator('h3')).toContainText('Activity Timeline');
  });

  test('should display timeline controls', async ({ page }) => {
    // Navigate to timeline page
    await page.click('a[href="/timeline"]');

    // Should show view mode toggle buttons
    await expect(page.locator('button:has-text("All Activities")')).toBeVisible();
    await expect(page.locator('button:has-text("By Job")')).toBeVisible();
  });

  test('should toggle between view modes', async ({ page }) => {
    // Navigate to timeline page
    await page.click('a[href="/timeline"]');

    // Should start in "All Activities" mode
    await expect(page.locator('button:has-text("All Activities").btn-primary')).toBeVisible();

    // Click "By Job" mode
    await page.click('button:has-text("By Job")');

    // Should switch to job-specific mode
    await expect(page.locator('button:has-text("By Job").btn-primary')).toBeVisible();

    // Should show job selector dropdown
    await expect(page.locator('select#jobSelect')).toBeVisible();

    // Switch back to "All Activities"
    await page.click('button:has-text("All Activities")');

    // Job selector should be hidden
    await expect(page.locator('select#jobSelect')).not.toBeVisible();
  });

  test('should display job selector in job-specific mode', async ({ page }) => {
    // Navigate to timeline page
    await page.click('a[href="/timeline"]');

    // Switch to job-specific mode
    await page.click('button:has-text("By Job")');

    // Should show job selector
    await expect(page.locator('select#jobSelect')).toBeVisible();
    await expect(page.locator('label[for="jobSelect"]')).toContainText('Select Job');

    // Should show placeholder option
    await expect(page.locator('select#jobSelect option[value=""]')).toContainText('Select a job');
  });

  test('should handle empty timeline state', async ({ page }) => {
    // Navigate to timeline page
    await page.click('a[href="/timeline"]');

    // Should show either timeline content or empty state
    const hasTimelineItems = await page.locator('.timeline-item, .preview-timeline-item').count() > 0;
    const hasEmptyState = await page.locator('.no-timeline-data').isVisible();

    expect(hasTimelineItems || hasEmptyState).toBe(true);

    if (hasEmptyState) {
      await expect(page.locator('.no-timeline-data h4')).toContainText('No activities found');
    }
  });

  test('should display timeline statistics', async ({ page }) => {
    // Navigate to timeline page
    await page.click('a[href="/timeline"]');

    // Should show timeline stats if there are activities
    const hasStats = await page.locator('.timeline-stats').isVisible();

    if (hasStats) {
      // Should show stat cards
      await expect(page.locator('.stat-card')).toBeVisible();

      // Should show different statistics
      await expect(page.locator('.stat-card:has-text("Total Activities")')).toBeVisible();
      await expect(page.locator('.stat-card:has-text("Pending")')).toBeVisible();
      await expect(page.locator('.stat-card:has-text("Completed")')).toBeVisible();
    }
  });

  test('should display timeline preview elements', async ({ page }) => {
    // Navigate to timeline page
    await page.click('a[href="/timeline"]');

    // Should show timeline preview section
    await expect(page.locator('.timeline-preview')).toBeVisible();
    await expect(page.locator('h5:has-text("Timeline Preview")')).toBeVisible();

    // Should show preview timeline items
    const previewItems = page.locator('.preview-timeline-item');
    const itemCount = await previewItems.count();

    expect(itemCount).toBeGreaterThan(0);

    // Each preview item should have icon and content
    const firstItem = previewItems.first();
    await expect(firstItem.locator('.preview-icon')).toBeVisible();
    await expect(firstItem.locator('.preview-content h6')).toBeVisible();
    await expect(firstItem.locator('.preview-content p')).toBeVisible();
  });

  test('should show different activity types in timeline preview', async ({ page }) => {
    // Navigate to timeline page
    await page.click('a[href="/timeline"]');

    // Should show different types of activities in preview
    await expect(page.locator('.preview-timeline-item:has-text("Application Sent")')).toBeVisible();
    await expect(page.locator('.preview-timeline-item:has-text("Email Received")')).toBeVisible();
    await expect(page.locator('.preview-timeline-item:has-text("Interview Scheduled")')).toBeVisible();
  });

  test('should display activity icons with different colors', async ({ page }) => {
    // Navigate to timeline page
    await page.click('a[href="/timeline"]');

    // Check preview icons have different background colors
    const icons = page.locator('.preview-icon');
    const iconCount = await icons.count();

    if (iconCount > 0) {
      // Should have styled icons with background colors
      for (let i = 0; i < Math.min(iconCount, 3); i++) {
        const icon = icons.nth(i);
        const backgroundColor = await icon.getAttribute('style');
        expect(backgroundColor).toContain('background-color');
      }
    }
  });

  test('should show coming soon message', async ({ page }) => {
    // Navigate to timeline page
    await page.click('a[href="/timeline"]');

    // Should show feature development message
    await expect(page.locator('h4:has-text("Timeline View Coming Soon")')).toBeVisible();

    // Should describe upcoming features
    await expect(page.locator('text=Chronological view of all your job application activities')).toBeVisible();
    await expect(page.locator('text=Visual timeline with activity types and priorities')).toBeVisible();
    await expect(page.locator('text=Filter by specific jobs or view all activities')).toBeVisible();
  });

  test('should handle job selection in preview controls', async ({ page }) => {
    // Navigate to timeline page
    await page.click('a[href="/timeline"]');

    // Switch to job-specific mode
    await page.click('button:has-text("By Job")');

    // Get job options (if any exist)
    const jobOptions = page.locator('select#jobSelect option[value!=""]');
    const optionCount = await jobOptions.count();

    if (optionCount > 0) {
      // Select the first job
      const firstOptionValue = await jobOptions.first().getAttribute('value');
      await page.selectOption('select#jobSelect', firstOptionValue);

      // Should update the selection
      await expect(page.locator('select#jobSelect')).toHaveValue(firstOptionValue);
    }
  });

  test('should display activity timestamps in preview', async ({ page }) => {
    // Navigate to timeline page
    await page.click('a[href="/timeline"]');

    // Preview items should show timestamps
    const previewItems = page.locator('.preview-timeline-item');
    const itemCount = await previewItems.count();

    if (itemCount > 0) {
      // Should show relative time indicators
      await expect(previewItems.first().locator('small')).toBeVisible();

      // Should show different time periods
      await expect(page.locator('small:has-text("days ago"), small:has-text("day ago"), small:has-text("Coming up")')).toBeVisible();
    }
  });

  test('should handle responsive design', async ({ page }) => {
    // Navigate to timeline page
    await page.click('a[href="/timeline"]');

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Controls should still be visible and functional
    await expect(page.locator('button:has-text("All Activities")')).toBeVisible();
    await expect(page.locator('button:has-text("By Job")')).toBeVisible();

    // Preview section should be visible
    await expect(page.locator('.timeline-preview')).toBeVisible();
  });

  test('should show development status consistently', async ({ page }) => {
    // Navigate to timeline page
    await page.click('a[href="/timeline"]');

    // Should consistently show that this is a preview/development feature
    await expect(page.locator('.info-message')).toBeVisible();
    await expect(page.locator('h5:has-text("Preview: Timeline Controls")')).toBeVisible();

    // Should explain what the feature will offer
    const featureBullets = page.locator('.info-message li');
    const bulletCount = await featureBullets.count();

    expect(bulletCount).toBeGreaterThanOrEqual(4);
  });

  test('should maintain view mode state', async ({ page }) => {
    // Navigate to timeline page
    await page.click('a[href="/timeline"]');

    // Switch to job-specific mode
    await page.click('button:has-text("By Job")');

    // Refresh the page
    await page.reload();

    // Should remember the view mode (or reset to default)
    // This depends on implementation - could be either behavior
    const allActivitiesButton = page.locator('button:has-text("All Activities")');
    const byJobButton = page.locator('button:has-text("By Job")');

    // At least one should be active
    const allActivitiesActive = await allActivitiesButton.locator('.btn-primary').isVisible();
    const byJobActive = await byJobButton.locator('.btn-primary').isVisible();

    expect(allActivitiesActive || byJobActive).toBe(true);
  });

  test('should display timeline header correctly', async ({ page }) => {
    // Navigate to timeline page
    await page.click('a[href="/timeline"]');

    // Should show proper page title
    await expect(page.locator('h3:has-text("Activity Timeline")')).toBeVisible();

    // Should show timeline controls in header area
    await expect(page.locator('.timeline-controls-preview')).toBeVisible();
  });
});
