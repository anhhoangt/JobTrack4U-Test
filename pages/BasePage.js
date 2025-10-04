/**
 * =====================================================
 * BASE PAGE OBJECT
 * =====================================================
 *
 * Base class for all page objects containing common functionality
 * and utility methods used across all pages.
 */

class BasePage {
  constructor(page) {
    this.page = page;
  }

  /**
   * Navigate to a specific URL
   * @param {string} url - The URL to navigate to
   */
  async navigate(url) {
    await this.page.goto(url);
  }

  /**
   * Wait for an element to be visible
   * @param {string} selector - The selector to wait for
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForElement(selector, timeout = 5000) {
    await this.page.waitForSelector(selector, { timeout });
  }

  /**
   * Wait for page to load by checking URL
   * @param {string} expectedUrl - Expected URL pattern
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForUrl(expectedUrl, timeout = 10000) {
    await this.page.waitForURL(expectedUrl, { timeout });
  }

  /**
   * Fill input field
   * @param {string} selector - Input selector
   * @param {string} value - Value to fill
   */
  async fillInput(selector, value) {
    await this.page.fill(selector, value);
  }

  /**
   * Click element
   * @param {string} selector - Element selector
   */
  async clickElement(selector) {
    await this.page.click(selector);
  }

  /**
   * Select option from dropdown
   * @param {string} selector - Select element selector
   * @param {string} value - Option value to select
   */
  async selectOption(selector, value) {
    await this.page.selectOption(selector, value);
  }

  /**
   * Get text content of element
   * @param {string} selector - Element selector
   * @returns {string} Text content
   */
  async getTextContent(selector) {
    return await this.page.locator(selector).textContent();
  }

  /**
   * Check if element is visible
   * @param {string} selector - Element selector
   * @returns {boolean} True if visible
   */
  async isVisible(selector) {
    return await this.page.locator(selector).isVisible();
  }

  /**
   * Get element count
   * @param {string} selector - Element selector
   * @returns {number} Number of matching elements
   */
  async getElementCount(selector) {
    return await this.page.locator(selector).count();
  }

  /**
   * Wait for loading to complete
   * @param {number} timeout - Wait timeout in milliseconds
   */
  async waitForTimeout(timeout = 1000) {
    await this.page.waitForTimeout(timeout);
  }

  /**
   * Handle dialog (confirm/alert)
   * @param {boolean} accept - Whether to accept or dismiss
   */
  setupDialogHandler(accept = true) {
    this.page.on('dialog', async dialog => {
      if (accept) {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    });
  }

  /**
   * Clear cookies (for logout scenarios)
   */
  async clearCookies() {
    await this.page.context().clearCookies();
  }

  /**
   * Reload the current page
   */
  async reload() {
    await this.page.reload();
  }

  /**
   * Go back in browser history
   */
  async goBack() {
    await this.page.goBack();
  }

  /**
   * Go forward in browser history
   */
  async goForward() {
    await this.page.goForward();
  }

  /**
   * Set viewport size for responsive testing
   * @param {number} width - Viewport width
   * @param {number} height - Viewport height
   */
  async setViewportSize(width, height) {
    await this.page.setViewportSize({ width, height });
  }
}

module.exports = BasePage;
