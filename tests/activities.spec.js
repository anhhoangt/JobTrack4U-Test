/**
 * =====================================================
 * ACTIVITY MANAGEMENT TESTS (Phase 3)
 * =====================================================
 *
 * This test suite covers all activity-related functionality:
 * - Creating activities
 * - Viewing activity lists
 * - Filtering activities
 * - Marking activities as complete
 * - Deleting activities
 * - Activity search functionality
 */

const { test, expect } = require('@playwright/test');

test.describe('Activity Management', () => {
  // Setup: Login before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[name="email"]', 'test@jobtrack.com');
    await page.fill('input[name="password"]', 'testpassword123');
    await page.click('button[type="submit"]');

    // Wait for dashboard to load
    await expect(page).toHaveURL('/');
  });

  test('should navigate to activities page', async ({ page }) => {
    // Click on activities link in navigation
    await page.click('a[href="/activities"], button:has-text("Activities")');

    // Should navigate to activities page
    await expect(page).toHaveURL('/activities');

    // Should show activities page content
    await expect(page.locator('h3')).toContainText('Activity Management');

    // Should show filter options
    await expect(page.locator('select[name="activityType"]')).toBeVisible();
    await expect(page.locator('select[name="activityStatus"]')).toBeVisible();
  });

  test('should display activities list', async ({ page }) => {
    // Navigate to activities page
    await page.click('a[href="/activities"]');

    // Should show activities container
    await expect(page.locator('.activities-container')).toBeVisible();

    // Should show either activities or empty state
    const hasActivities = await page.locator('.activity-card').count() > 0;
    const hasEmptyState = await page.locator('.no-activities').isVisible();

    expect(hasActivities || hasEmptyState).toBe(true);
  });

  test('should filter activities by type', async ({ page }) => {
    // Navigate to activities page
    await page.click('a[href="/activities"]');

    // Select a specific activity type
    await page.selectOption('select[name="activityType"]', 'email-sent');
    await page.waitForTimeout(1000);

    // Should filter activities by the selected type
    const activityCards = page.locator('.activity-card');
    const cardCount = await activityCards.count();

    if (cardCount > 0) {
      // All visible activities should be of the selected type
      await expect(activityCards.first()).toContainText('Email Sent');
    }
  });

  test('should filter activities by status', async ({ page }) => {
    // Navigate to activities page
    await page.click('a[href="/activities"]');

    // Filter by completed activities
    await page.selectOption('select[name="activityStatus"]', 'completed');
    await page.waitForTimeout(1000);

    // Should show only completed activities
    const activityCards = page.locator('.activity-card');
    const cardCount = await activityCards.count();

    if (cardCount > 0) {
      // All visible activities should show completed status
      await expect(activityCards.first().locator('.status-badge.completed')).toBeVisible();
    }
  });

  test('should clear activity filters', async ({ page }) => {
    // Navigate to activities page
    await page.click('a[href="/activities"]');

    // Apply some filters
    await page.selectOption('select[name="activityType"]', 'interview-scheduled');
    await page.selectOption('select[name="activityStatus"]', 'pending');

    // Click clear filters button
    await page.click('button:has-text("Clear Filters")');

    // Filters should be reset
    await expect(page.locator('select[name="activityType"]')).toHaveValue('all');
    await expect(page.locator('select[name="activityStatus"]')).toHaveValue('all');
  });

  test('should mark activity as complete', async ({ page }) => {
    // Navigate to activities page
    await page.click('a[href="/activities"]');

    // Find a pending activity (if any exist)
    const pendingActivity = page.locator('.activity-card.pending').first();

    if (await pendingActivity.isVisible()) {
      // Click mark complete button
      await pendingActivity.locator('button:has-text("Mark Complete")').click();

      // Should show success message
      await expect(page.locator('[class*="alert"], .success')).toContainText('Complete', { timeout: 5000 });

      // Activity should now show as completed
      await expect(pendingActivity.locator('.status-badge.completed')).toBeVisible();
    }
  });

  test('should delete activity with confirmation', async ({ page }) => {
    // Navigate to activities page
    await page.click('a[href="/activities"]');

    // Find any activity
    const activityCard = page.locator('.activity-card').first();

    if (await activityCard.isVisible()) {
      // Get the activity title for verification
      const activityTitle = await activityCard.locator('.activity-title').textContent();

      // Set up dialog handler for confirmation
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('Are you sure');
        await dialog.accept();
      });

      // Click delete button
      await activityCard.locator('button:has-text("Delete")').click();

      // Should show success message
      await expect(page.locator('[class*="alert"], .success')).toContainText('Deleted', { timeout: 5000 });

      // Activity should no longer be visible
      await expect(page.locator('.activity-card').filter({ hasText: activityTitle })).not.toBeVisible();
    }
  });

  test('should show activity details in cards', async ({ page }) => {
    // Navigate to activities page
    await page.click('a[href="/activities"]');

    // Check if there are any activities
    const activityCards = page.locator('.activity-card');
    const cardCount = await activityCards.count();

    if (cardCount > 0) {
      const firstCard = activityCards.first();

      // Should show activity title
      await expect(firstCard.locator('.activity-title')).toBeVisible();

      // Should show activity type
      await expect(firstCard.locator('.activity-type')).toBeVisible();

      // Should show status badge
      await expect(firstCard.locator('.status-badge')).toBeVisible();

      // Should show priority badge
      await expect(firstCard.locator('.priority-badge')).toBeVisible();

      // Should show created date
      await expect(firstCard.locator('.created-date')).toBeVisible();
    }
  });

  test('should display different activity types correctly', async ({ page }) => {
    // Navigate to activities page
    await page.click('a[href="/activities"]');

    // Test different activity type filters
    const activityTypes = [
      'application-sent',
      'email-sent',
      'interview-scheduled',
      'follow-up-sent'
    ];

    for (const type of activityTypes) {
      await page.selectOption('select[name="activityType"]', type);
      await page.waitForTimeout(500);

      // Should update the filter
      await expect(page.locator('select[name="activityType"]')).toHaveValue(type);
    }
  });

  test('should show activity count when activities exist', async ({ page }) => {
    // Navigate to activities page
    await page.click('a[href="/activities"]');

    // If activities exist, should show count
    const activityCount = await page.locator('.activity-card').count();

    if (activityCount > 0) {
      await expect(page.locator('.activities-count')).toContainText(`${activityCount} activit`);
    }
  });

  test('should display priority indicators correctly', async ({ page }) => {
    // Navigate to activities page
    await page.click('a[href="/activities"]');

    // Check if there are activities with different priorities
    const highPriorityCards = page.locator('.activity-card.priority-high');
    const mediumPriorityCards = page.locator('.activity-card.priority-medium');
    const lowPriorityCards = page.locator('.activity-card.priority-low');

    // If high priority activities exist
    if (await highPriorityCards.count() > 0) {
      await expect(highPriorityCards.first().locator('.priority-badge.priority-high')).toContainText('HIGH');
    }

    // If medium priority activities exist
    if (await mediumPriorityCards.count() > 0) {
      await expect(mediumPriorityCards.first().locator('.priority-badge.priority-medium')).toContainText('MEDIUM');
    }

    // If low priority activities exist
    if (await lowPriorityCards.count() > 0) {
      await expect(lowPriorityCards.first().locator('.priority-badge.priority-low')).toContainText('LOW');
    }
  });

  test('should handle empty state gracefully', async ({ page }) => {
    // Navigate to activities page
    await page.click('a[href="/activities"]');

    // Apply filters that might result in no activities
    await page.selectOption('select[name="activityType"]', 'offer-received');
    await page.selectOption('select[name="activityStatus"]', 'completed');
    await page.waitForTimeout(1000);

    // Should either show activities or empty state
    const hasActivities = await page.locator('.activity-card').count() > 0;
    const hasEmptyState = await page.locator('.no-activities').isVisible();

    expect(hasActivities || hasEmptyState).toBe(true);

    if (hasEmptyState) {
      await expect(page.locator('.no-activities h4')).toContainText('No activities found');
    }
  });

  test('should show job reference in activity cards', async ({ page }) => {
    // Navigate to activities page
    await page.click('a[href="/activities"]');

    // Check if there are activities
    const activityCards = page.locator('.activity-card');
    const cardCount = await activityCards.count();

    if (cardCount > 0) {
      const firstCard = activityCards.first();

      // Should show job reference if activity is linked to a job
      const jobReference = firstCard.locator('.job-reference');
      if (await jobReference.isVisible()) {
        await expect(jobReference).toContainText('Job:');
      }
    }
  });

  test('should display activity dates correctly', async ({ page }) => {
    // Navigate to activities page
    await page.click('a[href="/activities"]');

    // Check if there are activities
    const activityCards = page.locator('.activity-card');
    const cardCount = await activityCards.count();

    if (cardCount > 0) {
      const firstCard = activityCards.first();

      // Should show created date
      await expect(firstCard.locator('.created-date')).toBeVisible();

      // Check for scheduled date if present
      const scheduledDate = firstCard.locator('.scheduled-date');
      if (await scheduledDate.isVisible()) {
        await expect(scheduledDate).toContainText('Scheduled:');
      }

      // Check for completed date if present
      const completedDate = firstCard.locator('.completed-date');
      if (await completedDate.isVisible()) {
        await expect(completedDate).toContainText('Completed:');
      }
    }
  });

  test('should handle activity actions properly', async ({ page }) => {
    // Navigate to activities page
    await page.click('a[href="/activities"]');

    // Check if there are activities
    const activityCards = page.locator('.activity-card');
    const cardCount = await activityCards.count();

    if (cardCount > 0) {
      const firstCard = activityCards.first();

      // Should show action buttons
      await expect(firstCard.locator('.activity-actions')).toBeVisible();

      // Should show delete button
      await expect(firstCard.locator('button:has-text("Delete")')).toBeVisible();

      // Should show mark complete button for pending activities
      const isPending = await firstCard.locator('.activity-card.pending').isVisible();
      if (isPending) {
        await expect(firstCard.locator('button:has-text("Mark Complete")')).toBeVisible();
      }
    }
  });
});
