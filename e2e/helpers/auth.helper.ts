import { Page } from '@playwright/test';

export class AuthHelper {
  constructor(private page: Page) {}

  async login(email: string = 'test@example.com', password: string = 'Test123!@#') {
    await this.page.goto('/login');
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    await this.page.click('button[type="submit"]');

    // Wait for redirect to home or profile
    await this.page.waitForURL(/\/(home|profile)/, { timeout: 10000 });
  }

  async register(email: string, password: string, name: string = 'Test User') {
    await this.page.goto('/register');
    await this.page.fill('input[name="name"]', name);
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    await this.page.click('button[type="submit"]');

    // Wait for redirect
    await this.page.waitForURL(/\/(home|profile)/, { timeout: 10000 });
  }

  async logout() {
    await this.page.click('[data-testid="user-menu"]');
    await this.page.click('button:has-text("Logout")');
    await this.page.waitForURL('/login');
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      await this.page.waitForSelector('[data-testid="user-menu"]', { timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }
}
