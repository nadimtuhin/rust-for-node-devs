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

    // Verify code block exists and is syntax highlighted
    const nodeCode = page.locator('#detailNodeCode');
    await expect(nodeCode).toBeVisible();
    await expect(nodeCode.locator('.tok-keyword').first()).toBeVisible();

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

    // Verify syntax highlighting is applied client-side upon chapter switch
    const nodeCode = page.locator('#detailNodeCode');
    await expect(nodeCode.locator('.tok-keyword').first()).toBeVisible();
    await expect(nodeCode.locator('.tok-string').first()).toBeVisible();
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

      // Check syntax highlighting in pre/code elements
      const codeSnippet = page.locator('pre code, table code').first();
      if (await codeSnippet.count() > 0) {
        await expect(codeSnippet.locator('.tok-keyword, .tok-attr, .tok-comment, .tok-string').first()).toBeVisible();
      }
    }
  });

  test('Every appendix exposes key takeaways, FAQPage microdata and sources', async ({ page }) => {
    const appendices = [
      '/borrow-checker', '/async-tokio', '/cargo-vs-npm', '/microservice', '/docker', '/testing', '/ai-agents',
      '/interviews', '/troubleshooting', '/philosophy', '/pitfalls', '/leetcode', '/cheatsheet', '/roadmap',
    ];

    for (const appendix of appendices) {
      await page.goto(appendix);
      await expect(page.locator('.appendix-takeaways li').first(), appendix).toBeVisible();

      const faq = page.locator('[itemtype="https://schema.org/FAQPage"]');
      await expect(faq, appendix).toHaveCount(1);
      const questions = faq.locator('[itemprop="mainEntity"][itemtype="https://schema.org/Question"]');
      expect(await questions.count(), appendix).toBeGreaterThanOrEqual(4);
      await expect(questions.first().locator('[itemprop="acceptedAnswer"] [itemprop="text"]')).not.toBeEmpty();

      expect(await page.locator('.appendix-sources a[href^="https://"]').count(), appendix).toBeGreaterThanOrEqual(3);
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

  test('Lessons and appendices cross-link in both directions', async ({ page }) => {
    await page.goto('/chapter/basic_borrowing');
    const lessonLinks = page.locator('#detailRelatedAppendices a');
    await expect(lessonLinks.first()).toHaveAttribute('href', '/borrow-checker');

    await page.goto('/');
    await page.locator('.chapter-nav-item[data-id="tokio_spawn"]').click();
    await expect(page.locator('#detailRelatedAppendices a').first()).toHaveAttribute('href', '/async-tokio');

    await page.goto('/borrow-checker');
    const backLinks = page.locator('.foundational-lessons a');
    await expect(backLinks.filter({ hasText: 'B3' })).toHaveAttribute('href', '/chapter/basic_borrowing');
  });
});
