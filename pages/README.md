# Page Object Model (POM) Implementation

This directory contains the Page Object Model implementation for the JobTrack application's end-to-end tests.

## Overview

The Page Object Model (POM) is a design pattern that creates an abstraction layer between test scripts and the web application's UI. This pattern helps to:

- **Separate UI locators from test logic**: All locators are centralized in page objects
- **Improve maintainability**: Changes to UI only require updates in page objects
- **Increase reusability**: Page objects can be shared across multiple test files
- **Enhance readability**: Tests become more readable and focused on business logic

## Structure

```
pages/
├── BasePage.js              # Base class with common functionality
├── AuthPage.js              # Authentication/login page
├── DashboardPage.js         # Dashboard/stats page
├── NavigationComponent.js   # Shared navigation functionality
├── JobsPage.js              # All jobs listing page
├── AddJobPage.js            # Add/edit job form page
├── ActivitiesPage.js        # Activities management page
├── TimelinePage.js          # Timeline page
├── index.js                 # Central exports
└── README.md               # This file
```

## Base Classes

### BasePage.js
Contains common functionality used across all page objects:
- Navigation methods
- Element interaction utilities
- Wait methods
- Browser control methods

All page objects extend this base class.

## Page Objects

### AuthPage.js
Handles authentication functionality:
- Login/register form interactions
- Mode switching (login ↔ register)
- Form validation
- User session management

### NavigationComponent.js
Manages navigation across the application:
- Main navigation links
- Mobile navigation
- Sidebar navigation
- User menu and logout

### JobsPage.js
Manages job listing functionality:
- Job search and filtering
- Job card interactions
- Sorting options
- Enhanced field display

### AddJobPage.js
Handles job creation/editing:
- Form field interactions
- Multi-phase job data (basic, enhanced, phase2)
- Form validation
- Success/error handling

### ActivitiesPage.js
Manages activity functionality:
- Activity filtering
- Activity actions (complete, delete)
- Priority indicators
- Empty state handling

### TimelinePage.js
Handles timeline features:
- View mode toggles
- Timeline preview
- Statistics display
- Coming soon features

### DashboardPage.js
Dashboard/stats page functionality:
- Statistics display
- Page verification
- Content loading

## Usage Examples

### Basic Test Setup

```javascript
const { test, expect } = require('@playwright/test');
const { AuthPage, JobsPage, AddJobPage } = require('../pages');

test.describe('Job Management', () => {
  let authPage;
  let jobsPage;
  let addJobPage;

  test.beforeEach(async ({ page }) => {
    // Initialize page objects
    authPage = new AuthPage(page);
    jobsPage = new JobsPage(page);
    addJobPage = new AddJobPage(page);

    // Login before each test
    await authPage.performLogin();
  });

  test('should create a job', async ({ page }) => {
    // Navigate using page object
    await addJobPage.navigateToAddJob();

    // Create job using page object method
    const jobData = {
      position: 'Senior Engineer',
      company: 'Tech Corp',
      jobLocation: 'Remote'
    };

    await addJobPage.createTestJob(jobData);

    // Verify using page object
    expect(await addJobPage.isSuccessMessageVisible()).toBe(true);
  });
});
```

### Authentication Example

```javascript
// Login with default test user
await authPage.performLogin();

// Login with custom credentials
await authPage.performLogin({
  email: 'custom@email.com',
  password: 'custompassword'
});

// Register new user
const userData = {
  name: 'Test User',
  email: authPage.generateTestEmail(),
  password: 'testpassword123'
};
await authPage.register(userData);
```

### Navigation Example

```javascript
const navigation = new NavigationComponent(page);

// Navigate to different pages
await navigation.goToAllJobs();
await navigation.goToAddJob();
await navigation.goToActivities();

// Check navigation state
expect(await navigation.areMainNavLinksVisible()).toBe(true);
```

### Job Management Example

```javascript
// Create a comprehensive job
const jobData = {
  position: 'Full Stack Developer',
  company: 'Example Corp',
  jobLocation: 'San Francisco, CA',
  enhanced: {
    salaryMin: '100000',
    salaryMax: '150000',
    jobDescription: 'Exciting opportunity...'
  },
  phase2: {
    category: 'software-engineering',
    priority: 'high',
    tags: 'react, node.js, mongodb'
  }
};

await addJobPage.createJob(jobData);

// Search and filter jobs
await jobsPage.searchJobs('Full Stack');
await jobsPage.filterByStatus('interview');
await jobsPage.filterByPriority('high');

// Get job information
const jobDetails = await jobsPage.getFirstJobDetails();
expect(jobDetails.position).toContain('Full Stack');
```

## Key Benefits

### 1. Maintainability
- **Single Source of Truth**: All locators for a page are in one place
- **Easy Updates**: UI changes only require updates in the corresponding page object
- **Consistent Interface**: All page objects follow the same pattern

### 2. Reusability
- **Shared Methods**: Common actions can be reused across multiple tests
- **Component Reuse**: Navigation component can be used in any test
- **Test Data**: Built-in test data generation methods

### 3. Readability
- **Business Logic Focus**: Tests focus on what to test, not how to interact with UI
- **Self-Documenting**: Method names clearly indicate their purpose
- **Reduced Duplication**: Common actions are abstracted into methods

### 4. Robustness
- **Error Handling**: Built-in wait methods and error handling
- **Flexible Locators**: Multiple selector strategies for better reliability
- **State Verification**: Methods to verify page state and element visibility

## Best Practices

### 1. Method Naming
- Use descriptive method names: `fillRegistrationForm()` vs `fillForm()`
- Return meaningful data: `getJobDetails()` returns structured object
- Use consistent prefixes: `is`, `has`, `get`, `set`, `click`, etc.

### 2. Locator Strategy
- Use stable locators (data-testid, name attributes)
- Provide fallback selectors: `'[data-testid="button"], .primary-button'`
- Group related locators in objects

### 3. Error Handling
- Use try-catch for optional elements
- Provide meaningful error messages
- Handle different states (empty, loading, error)

### 4. Test Data
- Provide sensible defaults: `createTestJob()` with default values
- Allow customization: Accept parameters to override defaults
- Generate unique data: `generateTestEmail()` for unique identifiers

### 5. Waiting and Synchronization
- Use explicit waits: `waitForElement()`, `waitForUrl()`
- Verify page state: `verifyPageLoaded()` methods
- Handle dynamic content appropriately

## Migration Guide

To migrate existing tests to use POM:

1. **Import page objects**:
   ```javascript
   const { AuthPage, JobsPage } = require('../pages');
   ```

2. **Initialize in beforeEach**:
   ```javascript
   test.beforeEach(async ({ page }) => {
     authPage = new AuthPage(page);
     jobsPage = new JobsPage(page);
   });
   ```

3. **Replace direct page interactions**:
   ```javascript
   // Before
   await page.fill('input[name="email"]', 'test@example.com');
   await page.click('button[type="submit"]');

   // After
   await authPage.login({ email: 'test@example.com', password: 'password' });
   ```

4. **Use page object verification methods**:
   ```javascript
   // Before
   await expect(page).toHaveURL('/dashboard');

   // After
   expect(await dashboardPage.isOnDashboard()).toBe(true);
   ```

## Testing the POM Implementation

Run the POM-based tests to verify the implementation:

```bash
# Run POM authentication tests
npx playwright test tests/auth.pom.spec.js

# Run POM job management tests
npx playwright test tests/jobs.pom.spec.js

# Run all POM tests
npx playwright test tests/*.pom.spec.js
```

## Future Enhancements

Potential improvements to consider:

1. **Page Factory Pattern**: Automatic element initialization
2. **Data Builders**: Fluent API for test data creation
3. **Component Objects**: Reusable UI components (modals, dropdowns)
4. **Page State Management**: Track and verify page states
5. **Screenshots**: Automatic screenshot capture for debugging
6. **Reporting Integration**: Enhanced reporting with page object context
