# JobTrack E2E Test Suite

End-to-end test automation for the JobTrack application using Playwright and the Page Object Model (POM) pattern...

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- ...........
### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd jobtrack-e2e-tests

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Running Tests
```bash
# Run all tests
npm test

# Run tests in headed mode (visible browser)
npm run test:headed

# Run specific test file
npx playwright test tests/auth.spec.js

# Run tests with UI mode
npx playwright test --ui

# Run POM-based tests
npx playwright test tests/*.pom.spec.js
```

## 📁 Project Structure

```
jobtrack-e2e-tests/
├── pages/                  # Page Object Model files
│   ├── BasePage.js            # Base class with common functionality
│   ├── AuthPage.js            # Authentication/login page
│   ├── DashboardPage.js       # Dashboard/stats page
│   ├── NavigationComponent.js # Shared navigation functionality
│   ├── JobsPage.js            # Job listing and management
│   ├── AddJobPage.js          # Job creation/editing forms
│   ├── ActivitiesPage.js      # Activities management (Phase 3)
│   ├── TimelinePage.js        # Timeline functionality (Phase 3)
│   ├── index.js               # Central exports
│   └── README.md              # POM documentation
├── tests/                  # Test files
│   ├── auth.spec.js           # Authentication tests
│   ├── auth.pom.spec.js       # Authentication tests (POM version)
│   ├── jobs.spec.js           # Job management tests
│   ├── jobs.pom.spec.js       # Job management tests (POM version)
│   ├── activities.spec.js     # Activities tests (Phase 3)
│   ├── navigation.spec.js     # Navigation tests
│   └── timeline.spec.js       # Timeline tests (Phase 3)
├── global-setup.js         # Global test setup
├── global-teardown.js      # Global test teardown
├── playwright.config.js    # Playwright configuration
└── package.json           # Dependencies and scripts
```

## 🎯 Test Coverage

### ✅ **Authentication & Authorization**
- User registration and login
- Form validation and error handling
- Session management and persistence
- Logout functionality

### ✅ **Job Management (Phase 1 & 2)**
- Creating jobs with basic and enhanced fields
- Job listing, search, and filtering
- Job editing and deletion
- Enhanced fields: salary, description, company website, posting URL
- Phase 2 features: categories, tags, priority system

### ✅ **Activities Management (Phase 3)**
- Activity creation and management
- Activity filtering by type and status
- Marking activities as complete
- Activity deletion with confirmation
- Priority indicators and date management

### ✅ **Timeline Features (Phase 3)**
- Timeline navigation and controls
- View mode toggles (All Activities vs By Job)
- Timeline preview and statistics
- Coming soon features documentation

### ✅ **Navigation & UI**
- Cross-page navigation consistency
- Mobile navigation support
- Browser back/forward navigation
- Direct URL navigation

## 🏗️ Page Object Model (POM)

This project uses the Page Object Model pattern to separate UI locators from test logic, making tests more maintainable and reusable.

### Key Benefits:
- **Maintainability**: UI changes only require updates in page objects
- **Reusability**: Page objects can be shared across multiple tests
- **Readability**: Tests focus on business logic, not UI interaction details
- **Robustness**: Built-in error handling and wait strategies

### Usage Example:
```javascript
const { AuthPage, JobsPage, AddJobPage } = require('../pages');

test('should create a job', async ({ page }) => {
  const authPage = new AuthPage(page);
  const addJobPage = new AddJobPage(page);

  // Login using page object
  await authPage.performLogin();

  // Create job using page object
  await addJobPage.navigateToAddJob();
  await addJobPage.createTestJob({
    position: 'Senior Engineer',
    company: 'Tech Corp',
    jobLocation: 'Remote'
  });

  // Verify using page object
  expect(await addJobPage.isSuccessMessageVisible()).toBe(true);
});
```

See `/pages/README.md` for detailed POM documentation.

## 🔧 Configuration

### Application URL
Update the base URL in `playwright.config.js` to match your JobTrack application:

```javascript
module.exports = {
  use: {
    baseURL: 'http://localhost:3000', // Update this to your app URL
  },
  // ... other config
};
```

### Test User Credentials
The tests use a default test user. Update credentials in the page objects as needed:

```javascript
// In AuthPage.js
async performLogin(credentials = {
  email: 'test@jobtrack.com',
  password: 'testpassword123'
}) {
  // ... login logic
}
```

### Browser Configuration
Playwright is configured to run tests in:
- Chromium (default)
- Firefox
- WebKit (Safari)

Modify `playwright.config.js` to adjust browser settings.

## 📊 Test Reports

Playwright generates detailed HTML reports after test runs:

```bash
# Generate and open HTML report
npx playwright show-report

# View test results
npx playwright test --reporter=html
```

Reports include:
- Test execution details
- Screenshots on failures
- Video recordings (if enabled)
- Network activity logs

## 🚀 CI/CD Integration

### GitHub Actions Example
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### Jenkins Pipeline Example
```groovy
pipeline {
    agent any
    stages {
        stage('Install') {
            steps {
                sh 'npm ci'
                sh 'npx playwright install --with-deps'
            }
        }
        stage('Test') {
            steps {
                sh 'npm test'
            }
            post {
                always {
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'Playwright Report'
                    ])
                }
            }
        }
    }
}
```

## 🎨 Test Patterns

### Data-Driven Tests
```javascript
const testData = [
  { position: 'Frontend Developer', company: 'Tech Corp' },
  { position: 'Backend Engineer', company: 'StartupXYZ' },
];

testData.forEach(data => {
  test(`should create job: ${data.position}`, async ({ page }) => {
    // Test implementation using data
  });
});
```

### Page Object Inheritance
```javascript
class JobsPage extends BasePage {
  constructor(page) {
    super(page);
    // Page-specific initialization
  }

  // Page-specific methods
}
```

### Custom Matchers
```javascript
// In global-setup.js
expect.extend({
  async toBeJobCard(received, expected) {
    // Custom matcher implementation
  }
});
```

## 🐛 Debugging

### Debug Mode
```bash
# Run tests in debug mode
npx playwright test --debug

# Debug specific test
npx playwright test tests/auth.spec.js --debug
```

### Visual Debugging
```bash
# Run with trace viewer
npx playwright test --trace on

# Show trace for failed tests
npx playwright show-trace trace.zip
```

### Screenshots and Videos
Enable in `playwright.config.js`:
```javascript
module.exports = {
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  }
};
```

## 📝 Writing New Tests

### 1. Choose Test Type
- **Legacy tests**: Direct Playwright API usage
- **POM tests**: Using Page Object Model (recommended)

### 2. Create Test File
```javascript
const { test, expect } = require('@playwright/test');
const { AuthPage, NewFeaturePage } = require('../pages');

test.describe('New Feature', () => {
  let authPage;
  let newFeaturePage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    newFeaturePage = new NewFeaturePage(page);
    await authPage.performLogin();
  });

  test('should handle new feature', async ({ page }) => {
    // Test implementation
  });
});
```

### 3. Create Page Object (if needed)
```javascript
const BasePage = require('./BasePage');

class NewFeaturePage extends BasePage {
  constructor(page) {
    super(page);
    this.locators = {
      // Define locators
    };
  }

  // Add page-specific methods
}

module.exports = NewFeaturePage;
```

## 🔍 Best Practices

### Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Keep tests independent and isolated

### Page Objects
- Use stable locators (data-testid, name attributes)
- Provide meaningful method names
- Handle errors gracefully
- Use explicit waits

### Test Data
- Use unique test data to avoid conflicts
- Clean up test data after tests
- Use factories for complex test data

### Assertions
- Use specific assertions
- Provide meaningful error messages
- Test both positive and negative scenarios

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-test`
3. Write tests following the established patterns
4. Ensure all tests pass: `npm test`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For questions or issues:
1. Check the [Page Object Model documentation](pages/README.md)
2. Review existing test patterns
3. Create an issue in the repository
4. Contact the test automation team

## 📈 Test Metrics

### Current Coverage
- **Authentication**: 10+ test scenarios
- **Job Management**: 15+ test scenarios
- **Activities**: 8+ test scenarios
- **Timeline**: 12+ test scenarios
- **Navigation**: 6+ test scenarios

### Performance Targets
- Test execution time: < 5 minutes for full suite
- Individual test time: < 30 seconds
- Test reliability: > 95% pass rate

---

**Happy Testing! 🧪**
