# JobTrack E2E Tests Setup Guide

This guide will help you set up and run the JobTrack E2E test suite in its new standalone repository.

## 🚀 Quick Setup

### 1. Repository Setup
The e2e tests have been separated into a standalone repository:

```bash
# New standalone repository location
/Users/anhthehoang/Desktop/learning-code/jobtrack-e2e-tests/

# Original location (can be removed after migration)
/Users/anhthehoang/Desktop/learning-code/jobtrack/JobTrack4UApp-e2e-tests/
```

### 2. Install Dependencies
```bash
cd /Users/anhthehoang/Desktop/learning-code/jobtrack-e2e-tests
npm install
npx playwright install --with-deps
```

### 3. Verify Setup
```bash
# Test the setup with a quick auth test
npm run test:auth:pom -- --headed

# Or run a specific test file
npx playwright test tests/auth.pom.spec.js --headed
```

## 📁 Repository Structure

```
jobtrack-e2e-tests/
├── .github/workflows/         # CI/CD workflows
│   └── e2e-tests.yml         # GitHub Actions workflow
├── pages/                    # Page Object Model files
│   ├── BasePage.js              # Base class
│   ├── AuthPage.js              # Authentication
│   ├── DashboardPage.js         # Dashboard/Stats
│   ├── NavigationComponent.js   # Navigation
│   ├── JobsPage.js              # Job listing
│   ├── AddJobPage.js            # Job creation/editing
│   ├── ActivitiesPage.js        # Activities (Phase 3)
│   ├── TimelinePage.js          # Timeline (Phase 3)
│   ├── index.js                 # Central exports
│   └── README.md                # POM documentation
├── tests/                    # Test files
│   ├── auth.spec.js             # Legacy auth tests
│   ├── auth.pom.spec.js         # POM auth tests ⭐
│   ├── jobs.spec.js             # Legacy job tests
│   ├── jobs.pom.spec.js         # POM job tests ⭐
│   ├── activities.spec.js       # Activities tests
│   ├── navigation.spec.js       # Navigation tests
│   └── timeline.spec.js         # Timeline tests
├── .gitignore                # Git ignore rules
├── .github/                  # GitHub configuration
├── LICENSE                   # MIT License
├── README.md                 # Main documentation
├── SETUP.md                  # This setup guide
├── package.json              # Dependencies & scripts
├── playwright.config.js      # Playwright configuration
├── global-setup.js           # Global test setup
└── global-teardown.js        # Global test teardown
```

## 🧪 Available Test Scripts

### Basic Test Execution
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:auth          # Authentication tests
npm run test:jobs          # Job management tests
npm run test:activities    # Activities tests
npm run test:timeline      # Timeline tests
npm run test:navigation    # Navigation tests

# Run POM-based tests (recommended)
npm run test:pom           # All POM tests
npm run test:auth:pom      # POM auth tests
npm run test:jobs:pom      # POM job tests
```

### Advanced Test Options
```bash
# Interactive modes
npm run test:headed        # Run with visible browser
npm run test:ui            # Run with Playwright UI
npm run test:debug         # Run in debug mode

# Browser-specific
npm run test:chrome        # Chromium only
npm run test:firefox       # Firefox only
npm run test:safari        # WebKit only
npm run test:mobile        # Mobile viewport

# Performance and reporting
npm run test:parallel      # Run with 4 workers
npm run test:serial        # Run one at a time
npm run test:report        # Show HTML report
npm run test:trace         # Run with trace
```

### Test Categories
```bash
# Functional test categories (add @tags to tests)
npm run test:smoke         # Critical path tests
npm run test:regression    # Full regression suite

# Special test types
npx playwright test --grep="@visual"      # Visual regression
npx playwright test --grep="@performance" # Performance tests
```

## 🎯 Test Coverage Overview

### ✅ **Phase 1: Core Features**
- ✅ Authentication (login/register)
- ✅ Basic job management (CRUD)
- ✅ Job search and filtering
- ✅ Navigation between pages

### ✅ **Phase 2: Enhanced Features**
- ✅ Enhanced job fields (salary, description, etc.)
- ✅ Job categories and tags
- ✅ Priority system
- ✅ Advanced filtering

### ✅ **Phase 3: Advanced Features**
- ✅ Activities management
- ✅ Activity filtering and actions
- ✅ Timeline functionality
- ✅ Timeline controls and preview

## 🔧 Configuration

### Application URL
Update the base URL in `playwright.config.js`:

```javascript
module.exports = {
  use: {
    baseURL: 'http://localhost:3000', // Your JobTrack app URL
  },
};
```

### Test User Credentials
Default test user in `pages/AuthPage.js`:

```javascript
// Default credentials used in tests
email: 'test@jobtrack.com'
password: 'testpassword123'
```

Update these as needed for your environment.

## 🏗️ Page Object Model (POM)

The new POM implementation provides:

### **Benefits**
- 🎯 **Maintainability**: UI changes only require page object updates
- 🔄 **Reusability**: Share page objects across multiple tests
- 📖 **Readability**: Tests focus on business logic, not UI details
- 🛡️ **Robustness**: Built-in error handling and wait strategies

### **Usage Example**
```javascript
const { AuthPage, AddJobPage, JobsPage } = require('../pages');

test('Complete job workflow', async ({ page }) => {
  const authPage = new AuthPage(page);
  const addJobPage = new AddJobPage(page);
  const jobsPage = new JobsPage(page);
  
  // Login using page object
  await authPage.performLogin();
  
  // Create job using page object
  await addJobPage.navigateToAddJob();
  await addJobPage.createTestJob({
    position: 'Senior Engineer',
    company: 'Tech Corp'
  });
  
  // Verify in job listing
  await jobsPage.navigateToJobs();
  expect(await jobsPage.jobCardContainsText('Tech Corp')).toBe(true);
});
```

## 🚀 CI/CD Integration

### GitHub Actions
The repository includes a comprehensive GitHub Actions workflow:

- ✅ **Multi-browser testing** (Chrome, Firefox, Safari)
- ✅ **Smoke tests** on pull requests
- ✅ **Visual regression testing**
- ✅ **Mobile testing**
- ✅ **Performance monitoring**
- ✅ **Scheduled daily runs**
- ✅ **Automatic issue creation** on failures
- ✅ **Test reports and artifacts**

### Setting up GitHub Repository

1. **Create GitHub repository**:
   ```bash
   # On GitHub, create a new repository named: jobtrack-e2e-tests
   ```

2. **Push to GitHub**:
   ```bash
   cd /Users/anhthehoang/Desktop/learning-code/jobtrack-e2e-tests
   git remote add origin https://github.com/your-username/jobtrack-e2e-tests.git
   git branch -M main
   git push -u origin main
   ```

3. **Configure GitHub Actions**:
   - The workflow file is already included: `.github/workflows/e2e-tests.yml`
   - Configure any secrets needed (Slack webhooks, etc.)

## 🐛 Debugging & Troubleshooting

### Common Issues

1. **Application not running**:
   ```bash
   # Make sure your JobTrack app is running on the configured URL
   # Update baseURL in playwright.config.js if needed
   ```

2. **Test user doesn't exist**:
   ```bash
   # Create test user in your application or update credentials in AuthPage.js
   ```

3. **Browser installation issues**:
   ```bash
   # Reinstall Playwright browsers
   npx playwright install --with-deps --force
   ```

### Debug Mode
```bash
# Run specific test in debug mode
npx playwright test tests/auth.pom.spec.js --debug

# Run with trace for detailed investigation
npx playwright test --trace on
npx playwright show-trace trace.zip
```

### Visual Debugging
```bash
# Run with headed browser to see the test execution
npm run test:headed

# Use Playwright UI for interactive debugging
npm run test:ui
```

## 📊 Test Reports

### HTML Reports
```bash
# Generate and view HTML report
npm run test:report

# Or manually
npx playwright show-report
```

### Trace Viewer
```bash
# Run with trace enabled
npm run test:trace

# View trace file
npx playwright show-trace test-results/*/trace.zip
```

## 🎨 Writing New Tests

### 1. Choose Test Type
- **POM Tests** (recommended): Use page objects for maintainability
- **Legacy Tests**: Direct Playwright API (for simple cases)

### 2. Example POM Test
```javascript
const { test, expect } = require('@playwright/test');
const { AuthPage, NewFeaturePage } = require('../pages');

test.describe('New Feature Tests', () => {
  let authPage;
  let newFeaturePage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    newFeaturePage = new NewFeaturePage(page);
    await authPage.performLogin();
  });

  test('should handle new feature', async ({ page }) => {
    await newFeaturePage.navigateToNewFeature();
    await newFeaturePage.performAction();
    expect(await newFeaturePage.isActionSuccessful()).toBe(true);
  });
});
```

### 3. Create Page Object (if needed)
```javascript
// pages/NewFeaturePage.js
const BasePage = require('./BasePage');

class NewFeaturePage extends BasePage {
  constructor(page) {
    super(page);
    this.locators = {
      actionButton: '[data-testid="action-button"]',
      successMessage: '.success-message'
    };
  }

  async navigateToNewFeature() {
    await this.navigate('/new-feature');
  }

  async performAction() {
    await this.clickElement(this.locators.actionButton);
  }

  async isActionSuccessful() {
    return await this.isVisible(this.locators.successMessage);
  }
}

module.exports = NewFeaturePage;
```

## 🔄 Migration from Original E2E Tests

If you want to remove the original e2e tests from the main repository:

```bash
# Remove the original e2e tests directory
rm -rf /Users/anhthehoang/Desktop/learning-code/jobtrack/JobTrack4UApp-e2e-tests/

# Update any references in your main application
# (package.json scripts, documentation, etc.)
```

## 📈 Performance Benchmarks

### Target Metrics
- **Full test suite**: < 5 minutes
- **Individual test**: < 30 seconds
- **Test reliability**: > 95% pass rate

### Current Test Count
- **Authentication**: 11 test scenarios
- **Job Management**: 16 test scenarios
- **Activities**: 8 test scenarios
- **Timeline**: 12 test scenarios
- **Navigation**: 6 test scenarios
- **Total**: 53+ test scenarios

## 🆘 Support & Next Steps

### Immediate Next Steps
1. ✅ Repository separated and set up
2. ⏭️ Test the setup with your JobTrack application
3. ⏭️ Update any CI/CD pipelines to use the new repository
4. ⏭️ Configure GitHub repository and Actions
5. ⏭️ Train team members on the new POM structure

### Getting Help
- 📖 Read the comprehensive [README.md](README.md)
- 📋 Check the [Page Object Model documentation](pages/README.md)
- 🐛 Create issues in the GitHub repository
- 💬 Ask questions in team chat/meetings

---

**Your JobTrack E2E test suite is now ready to use! 🧪✨**