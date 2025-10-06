/**
 * =====================================================
 * AUTHENTICATION PAGE OBJECT
 * =====================================================
 *
 * Page object for login/register functionality
 */

const BasePage = require('./BasePage');

class AuthPage extends BasePage {
  constructor(page) {
    super(page);

    // Locators
    this.locators = {
      // Form elements
      nameInput: 'input[name="name"]',
      emailInput: 'input[name="email"]',
      passwordInput: 'input[name="password"]',
      submitButton: 'button[type="submit"]',

      // Mode toggle buttons
      signUpButton: 'button:has-text("Register Now"), button.member-btn:has-text("Register")',
      signInButton: 'button:has-text("Login Here"), button.member-btn:has-text("Login")',

      // Page elements
      pageTitle: 'h3',
      alertMessage: '[class*="alert"], .error, [role="alert"]',

      // Navigation after auth - user info appears in different places
      userInfo: '.btn-container .btn, .nav-center .btn, button:has-text("anh"), .nav-links, .sidebar .nav-links, .big-sidebar .nav-links',
      dashboardContent: 'h1, h2, h3, .logo-text',

      // Logout elements
      logoutButton: 'button:has-text("logout"), button:has-text("Logout"), button:has-text("Sign Out"), [data-testid="logout-button"]',
      userMenu: '[data-testid="user-menu"], .user-dropdown, .nav-user, .btn-container .btn',
      dropdownToggle: '.btn-container .btn, button:has-text("anh"), .dropdown-btn'
    };
  }

  /**
   * Navigate to register/login page
   */
  async navigateToAuth() {
    await this.navigate('/register');
  }

  /**
   * Switch to register mode
   */
  async switchToRegister() {
    const registerButton = this.page.locator(this.locators.signUpButton);
    if (await registerButton.isVisible()) {
      await this.clickElement(this.locators.signUpButton);
    }
  }

  /**
   * Switch to login mode
   */
  async switchToLogin() {
    const loginButton = this.page.locator(this.locators.signInButton);
    if (await loginButton.isVisible()) {
      await this.clickElement(this.locators.signInButton);
    }
  }

  /**
   * Fill registration form
   * @param {Object} userData - User data object
   * @param {string} userData.name - User name
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   */
  async fillRegistrationForm(userData) {
    // First switch to register mode to show all registration fields
    await this.switchToRegister();

    // Wait for the form to update and show name field
    await this.waitForTimeout(1000);

    // Fill all registration fields (name, email, password)
    await this.fillInput(this.locators.nameInput, userData.name);
    await this.fillInput(this.locators.emailInput, userData.email);
    await this.fillInput(this.locators.passwordInput, userData.password);
  }

  /**
   * Fill login form
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   */
  async fillLoginForm(credentials) {
    await this.switchToLogin();
    await this.fillInput(this.locators.emailInput, credentials.email);
    await this.fillInput(this.locators.passwordInput, credentials.password);
  }

  /**
   * Submit authentication form
   */
  async submitForm() {
    await this.clickElement(this.locators.submitButton);
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   */
  async register(userData) {
    await this.fillRegistrationForm(userData);
    await this.submitForm();
  }

  /**
   * Login with existing credentials
   * @param {Object} credentials - Login credentials
   */
  async login(credentials) {
    await this.fillLoginForm(credentials);
    await this.submitForm();
  }

  /**
   * Perform full login flow (navigate + login)
   * @param {Object} credentials - Login credentials
   */
  async performLogin(credentials = { email: 'aaaa@gmail.com', password: 'aaaaaa' }) {
    await this.navigateToAuth();
    await this.login(credentials);
    await this.waitForUrl('/');
  }

  /**
   * Logout user
   */
  async logout() {
    // First try to click the user button (with "anh" text) to open dropdown
    const userButton = this.page.locator('button:has-text("anh")').first();

    if (await userButton.isVisible()) {
      await userButton.click();
      // Wait for dropdown to open
      await this.waitForTimeout(1000);
    }

    // Now try to find and click the logout button
    const logoutButton = this.page.locator('button:has-text("logout")').first();

    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    } else {
      // If still not visible, try alternative selectors
      const altLogoutButton = this.page.locator(this.locators.logoutButton).first();
      if (await altLogoutButton.isVisible()) {
        await altLogoutButton.click();
      }
    }

    // Wait for navigation to complete with more flexible approach
    try {
      await this.waitForUrl('/landing');
    } catch (error) {
      // If landing page doesn't load, wait for any navigation away from current page
      await this.waitForTimeout(3000);

      // Check if we're on landing page or any other auth page
      if (!this.page.url().includes('/landing') && !this.page.url().includes('/register')) {
        // If logout didn't work as expected, try to navigate to landing directly
        await this.navigate('/landing');
      }
    }
  }

  /**
   * Check if user is on register page
   * @returns {boolean} True if on register page
   */
  async isOnRegisterPage() {
    return this.page.url().includes('/register') || this.page.url().includes('/landing');
  }

  /**
   * Check if user is on dashboard
   * @returns {boolean} True if on dashboard
   */
  async isOnDashboard() {
    return this.page.url() === `${this.page.url().split('/')[0]}//${this.page.url().split('/')[2]}/`;
  }

  /**
   * Check if alert message is visible
   * @returns {boolean} True if alert is visible
   */
  async isAlertVisible() {
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
   * Check if name field is visible (register mode indicator)
   * @returns {boolean} True if name field is visible
   */
  async isNameFieldVisible() {
    return await this.isVisible(this.locators.nameInput);
  }

  /**
   * Check if user info is displayed (logged in indicator)
   * @returns {boolean} True if user info is visible
   */
  async isUserInfoVisible() {
    return await this.isVisible(this.locators.userInfo);
  }

  /**
   * Get page title text
   * @returns {string} Page title text
   */
  async getPageTitle() {
    return await this.getTextContent(this.locators.pageTitle);
  }

  /**
   * Check email field validation message
   * @returns {string} Validation message
   */
  async getEmailValidationMessage() {
    const emailInput = this.page.locator(this.locators.emailInput);
    return await emailInput.evaluate(el => el.validationMessage);
  }

  /**
   * Check if form fields are empty
   * @returns {Object} Object with field values
   */
  async getFormValues() {
    return {
      name: await this.page.locator(this.locators.nameInput).inputValue(),
      email: await this.page.locator(this.locators.emailInput).inputValue(),
      password: await this.page.locator(this.locators.passwordInput).inputValue()
    };
  }

  /**
   * Generate unique test email
   * @returns {string} Unique email address
   */
  generateTestEmail() {
    const timestamp = Date.now();
    return `test${timestamp}@jobtrack.com`;
  }
}

module.exports = AuthPage;
