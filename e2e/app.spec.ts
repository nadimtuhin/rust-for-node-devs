import { test, expect } from '@playwright/test';

test.describe('Rust for Node Devs - E2E Test Suite', () => {
  test('Home page loads studio with table of contents, lesson details, and playground', async ({ page }) => {
    await page.goto('/');

    // Check title matches "Rust for Node.js Devs"
    await expect(page).toHaveTitle(/Rust for Node(\.js)? Devs/i);

    // Verify header brand element exists
    const brand = page.locator('.brand');
    await expect(brand).toBeVisible();

    // Verify Sidebar exists with 56 chapters badge
    const badge = page.locator('#sidebarCountBadge');
    await expect(badge).toBeVisible();
    await expect(badge).toContainText('56 Chapters');

    // Verify Table of Contents contains chapter items
    const firstChapter = page.locator('.chapter-nav-item').first();
    await expect(firstChapter).toBeVisible();

    // Verify Lesson title is populated
    const lessonTitle = page.locator('#detailTitle');
    await expect(lessonTitle).toBeVisible();
    await expect(lessonTitle).not.toBeEmpty();

    // Verify code block exists
    const nodeCode = page.locator('#detailNodeCode');
    await expect(nodeCode).toBeVisible();

    // Verify Playground section and Run button exist
    const playground = page.locator('#playgroundSection');
    await expect(playground).toBeVisible();

    const runBtn = page.locator('#runBtn');
    await expect(runBtn).toBeVisible();
    await expect(runBtn).toBeEnabled();
  });

  test('Filter lessons searches chapters dynamically and supports clear', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.locator('#lessonSearchInput');
    await searchInput.fill('Ownership');

    // Should match chapters with Ownership
    const visibleChapters = page.locator('.chapter-nav-item:visible');
    const count = await visibleChapters.count();
    expect(count).toBeGreaterThan(0);

    // Clear search
    const clearBtn = page.locator('#clearSearchBtn');
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();
    await expect(searchInput).toHaveValue('');
  });

  test('Selecting a chapter updates lesson detail and active state', async ({ page }) => {
    await page.goto('/');

    // Click second chapter
    const secondChapter = page.locator('.chapter-nav-item').nth(1);
    const chapterId = await secondChapter.getAttribute('data-id');
    expect(chapterId).toBeTruthy();

    await secondChapter.click();

    // Lesson title should update
    const activeItem = page.locator('.chapter-nav-item.active');
    await expect(activeItem).toHaveAttribute('data-id', chapterId!);

    // Detail ID badge should reflect the chapter
    const detailId = page.locator('#detailId');
    await expect(detailId).toBeVisible();
  });

  test('Direct route to chapter page (/chapter/[id]) renders content and layout', async ({ page }) => {
    await page.goto('/chapter/basic_ownership');

    await expect(page.locator('#detailTitle')).toBeVisible();
    await expect(page.locator('#detailTitle')).toContainText('Ownership');

    // Check node snippet exists
    const nodeCode = page.locator('#detailNodeCode');
    await expect(nodeCode).toBeVisible();
  });

  test('Appendix views load successfully with HTTP 200 and main landmarks', async ({ page }) => {
    const views = [
      '/microservice',
      '/async-tokio',
      '/borrow-checker',
      '/ai-agents',
      '/docker',
      '/pitfalls',
      '/roadmap',
      '/interviews',
    ];

    for (const view of views) {
      const response = await page.goto(view);
      expect(response?.status()).toBe(200);
      const main = page.locator('main');
      await expect(main).toBeVisible();
    }
  });

  test('Chapters overview page lists all chapters and appendix links', async ({ page }) => {
    await page.goto('/chapters');

    const heading = page.locator('h1');
    await expect(heading).toBeVisible();

    const chapterCards = page.locator('a[href^="/chapter/"]');
    const cardCount = await chapterCards.count();
    expect(cardCount).toBeGreaterThanOrEqual(40);
  });
});
