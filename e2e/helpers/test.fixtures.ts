import { test as base } from '@playwright/test';
import { AuthHelper } from './auth.helper';
import { VCardHelper } from './vcard.helper';

type TestFixtures = {
  authHelper: AuthHelper;
  vcardHelper: VCardHelper;
  authenticatedPage: void;
};

export const test = base.extend<TestFixtures>({
  authHelper: async ({ page }, use) => {
    const authHelper = new AuthHelper(page);
    await use(authHelper);
  },

  vcardHelper: async ({ page }, use) => {
    const vcardHelper = new VCardHelper(page);
    await use(vcardHelper);
  },

  authenticatedPage: async ({ page, authHelper }, use) => {
    // Auto-login before each test
    await authHelper.login();
    await use();
  },
});

export { expect } from '@playwright/test';
