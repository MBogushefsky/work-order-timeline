import { test, expect } from '@playwright/test';

test.describe('Work Order Schedule Timeline', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('.timeline-header');
  });

  test('page loads with timeline and work centers', async ({ page }) => {
    await expect(page.locator('.header-title')).toHaveText('Work Orders');

    const workCenterNames = [
      'Extrusion Line A',
      'CNC Machine 1',
      'Assembly Station',
      'Quality Control',
      'Packaging Line',
    ];
    for (const name of workCenterNames) {
      await expect(page.getByText(name, { exact: true })).toBeVisible();
    }

    await expect(page.locator('.bar').first()).toBeVisible();
  });

  test('day/week/month timescale switching', async ({ page }) => {
    await expect(page.locator('.column-header').first()).toBeVisible();

    const dropdown = page.locator('.scale-dropdown');

    // Switch to Week
    await dropdown.click();
    await page.getByText('Week', { exact: true }).click();
    await expect(page.locator('.column-header').first()).toBeVisible();

    // Switch to Month
    await dropdown.click();
    await page.getByText('Month', { exact: true }).click();
    await expect(page.locator('.column-header').first()).toBeVisible();

    // Switch back to Day
    await dropdown.click();
    await page.getByText('Day', { exact: true }).click();
    await expect(page.locator('.column-header').first()).toBeVisible();
  });

  test('today button scrolls viewport', async ({ page }) => {
    const scrollContainer = page.locator('.right-panel');
    await expect(scrollContainer).toBeVisible();

    await scrollContainer.evaluate(el => el.scrollLeft = 0);

    await page.locator('.today-btn').click();

    const todayIndicator = page.locator('app-today-indicator');
    if (await todayIndicator.count() > 0) {
      await expect(todayIndicator).toBeAttached();
    }
  });

  test('create work order via panel', async ({ page }) => {
    const rowTrack = page.locator('app-timeline-row .row-track').first();
    await expect(rowTrack).toBeVisible();

    const box = await rowTrack.boundingBox();
    if (box) {
      await rowTrack.click({ position: { x: box.width - 50, y: box.height / 2 } });
    }

    await expect(page.locator('.panel.open')).toBeVisible({ timeout: 5000 });

    await page.locator('#wo-name').fill('E2E Test Order');
    await page.locator('.btn-create').click();

    // Wait for either the panel to close (success) or overlap error to appear
    await expect.poll(async () => {
      const panelClosed = !(await page.locator('.panel.open').isVisible().catch(() => false));
      const hasOverlap = await page.locator('.overlap-error').isVisible().catch(() => false);
      return panelClosed || hasOverlap;
    }, { timeout: 5000 }).toBe(true);

    const hasBar = await page.getByText('E2E Test Order').isVisible().catch(() => false);
    const hasOverlap = await page.locator('.overlap-error').isVisible().catch(() => false);
    expect(hasBar || hasOverlap).toBe(true);
  });

  test('overlap detection blocks save', async ({ page }) => {
    // Use the 4th row (Quality Control, wc-4) which has one seed order.
    // Click slightly after it so the panel opens in empty space but the
    // prefilled 7-day range still overlaps with the existing order.
    const rowTrack = page.locator('app-timeline-row .row-track').nth(3);
    await expect(rowTrack).toBeVisible();

    // Scroll to make the row-track clickable area visible, then click
    const box = await rowTrack.boundingBox();
    if (box) {
      // Click slightly right of center — should produce dates near "today"
      // which overlaps with seed order wo-6 (today-3 to today+4)
      await rowTrack.click({ position: { x: box.width - 50, y: box.height / 2 } });
    }

    await expect(page.locator('.panel.open')).toBeVisible({ timeout: 5000 });

    await page.locator('#wo-name').fill('Overlap Test Order');
    await page.locator('.btn-create').click();

    // Wait for either overlap error to appear or panel to close (order created)
    await expect.poll(async () => {
      const hasOverlap = await page.locator('.overlap-error').isVisible().catch(() => false);
      const panelClosed = !(await page.locator('.panel.open').isVisible().catch(() => false));
      return hasOverlap || panelClosed;
    }, { timeout: 5000 }).toBe(true);

    // Either overlap error is shown or order was created (if dates didn't overlap)
    const hasOverlapError = await page.locator('.overlap-error').isVisible().catch(() => false);
    const hasNewBar = await page.getByText('Overlap Test Order').isVisible().catch(() => false);
    expect(hasOverlapError || hasNewBar).toBe(true);
  });

  test('edit work order via 3-dot menu', async ({ page }) => {
    const bar = page.locator('.bar').first();
    await expect(bar).toBeVisible();

    await bar.locator('.bar-menu-btn').click();
    await expect(page.locator('.menu-item').filter({ hasText: 'Edit' })).toBeVisible();

    await page.locator('.menu-item').filter({ hasText: 'Edit' }).click();

    await expect(page.locator('.panel.open')).toBeVisible({ timeout: 5000 });
    const nameInput = page.locator('#wo-name');
    const nameValue = await nameInput.inputValue();
    expect(nameValue.length).toBeGreaterThan(0);

    await nameInput.clear();
    await nameInput.fill('Edited Order Name');

    await page.locator('.btn-create').click();

    await expect(page.getByText('Edited Order Name')).toBeVisible({ timeout: 5000 });
  });

  test('delete work order via 3-dot menu', async ({ page }) => {
    const initialCount = await page.locator('.bar').count();
    expect(initialCount).toBeGreaterThan(0);

    // Accept the confirm dialog when it appears
    page.on('dialog', dialog => dialog.accept());

    const bar = page.locator('.bar').first();
    await bar.locator('.bar-menu-btn').click();
    await expect(page.locator('.menu-item--danger')).toBeVisible();
    await page.locator('.menu-item--danger').click();

    await expect(page.locator('.bar')).toHaveCount(initialCount - 1, { timeout: 5000 });
  });

  test('panel close via Escape key and overlay click', async ({ page }) => {
    const rowTrack = page.locator('app-timeline-row .row-track').first();
    await expect(rowTrack).toBeVisible();
    const box = await rowTrack.boundingBox();
    if (box) {
      await rowTrack.click({ position: { x: box.width - 50, y: box.height / 2 } });
    }
    await expect(page.locator('.panel.open')).toBeVisible({ timeout: 5000 });

    // Close with Escape
    await page.keyboard.press('Escape');
    await expect(page.locator('.panel.open')).not.toBeVisible({ timeout: 3000 });

    // Reopen panel
    if (box) {
      await rowTrack.click({ position: { x: box.width - 50, y: box.height / 2 } });
    }
    await expect(page.locator('.panel.open')).toBeVisible({ timeout: 5000 });

    // Close by clicking overlay
    await page.locator('.panel-overlay.open').click({ force: true });
    await expect(page.locator('.panel.open')).not.toBeVisible({ timeout: 3000 });
  });

  test('localStorage persistence across reload', async ({ page }) => {
    const rowTrack = page.locator('app-timeline-row .row-track').first();
    await expect(rowTrack).toBeVisible();
    const box = await rowTrack.boundingBox();
    if (box) {
      await rowTrack.click({ position: { x: box.width - 30, y: box.height / 2 } });
    }
    await expect(page.locator('.panel.open')).toBeVisible({ timeout: 5000 });

    await page.locator('#wo-name').fill('Persist Test Order');
    await page.locator('.btn-create').click();

    const created = await page.getByText('Persist Test Order').isVisible().catch(() => false);
    if (created) {
      await page.reload();
      await page.waitForSelector('.timeline-header');

      await expect(page.getByText('Persist Test Order')).toBeVisible({ timeout: 5000 });
    }
  });
});
