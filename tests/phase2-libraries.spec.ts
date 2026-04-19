import { test, expect } from "@playwright/test";

// ─── HQ Dev Nav ──────────────────────────────────────────────────────────────

test("HQ shows dev navigation links", async ({ page }) => {
  await page.goto("/hq");
  await expect(page.getByRole("link", { name: "TRAIN" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "CHOW" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "LOG" }).first()).toBeVisible();
});

// ─── Bottom Nav ───────────────────────────────────────────────────────────────

test("BottomNav highlights correct active item on /train", async ({ page }) => {
  await page.goto("/train");
  // Active colour is on the span inside the link
  const trainLabel = page.locator("nav a").filter({ hasText: "TRAIN" }).locator("span.font-display");
  await expect(trainLabel).toHaveClass(/text-ets-accent/);
});

test("BottomNav RANGE item is disabled (no pointer events)", async ({ page }) => {
  await page.goto("/hq");
  // RANGE is rendered as a div with pointer-events-none
  const rangeItem = page.locator("nav .pointer-events-none");
  await expect(rangeItem).toBeVisible();
  await expect(rangeItem).toContainText("RANGE");
});

test("BottomNav highlights correct active item on /chow", async ({ page }) => {
  await page.goto("/chow");
  const chowLabel = page.locator("nav a").filter({ hasText: "CHOW" }).locator("span.font-display");
  await expect(chowLabel).toHaveClass(/text-ets-accent/);
});

// ─── TRAIN List ───────────────────────────────────────────────────────────────

test("TRAIN page renders SecHero with correct title", async ({ page }) => {
  await page.goto("/train");
  await expect(page.getByRole("heading", { name: "TRAIN" })).toBeVisible();
  await expect(page.getByText("LIBRARY")).toBeVisible();
});

test("TRAIN page shows exercise list rows", async ({ page }) => {
  await page.goto("/train");
  // At least 5 exercise rows visible
  const rows = page.locator("a[href^='/train/']");
  await expect(rows).toHaveCount(25);
});

test("TRAIN search filters exercises by name", async ({ page }) => {
  await page.goto("/train");
  await page.getByPlaceholder("SEARCH EXERCISES").fill("pull");
  const rows = page.locator("a[href^='/train/']");
  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toContainText("Pull-up");
});

test("TRAIN search filters exercises by muscle", async ({ page }) => {
  await page.goto("/train");
  await page.getByPlaceholder("SEARCH EXERCISES").fill("glutes");
  const rows = page.locator("a[href^='/train/']");
  const count = await rows.count();
  expect(count).toBeGreaterThanOrEqual(1);
});

test("TRAIN category filter CALISTHENICS shows only calisthenics", async ({ page }) => {
  await page.goto("/train");
  await page.getByRole("button", { name: "CALISTHENICS" }).click();
  const rows = page.locator("a[href^='/train/']");
  await expect(rows).toHaveCount(10);
  // All visible badges should be CAL
  const badges = page.locator("a[href^='/train/'] div.bg-ets-border span");
  const texts = await badges.allTextContents();
  expect(texts.every((t) => t.trim() === "CAL")).toBe(true);
});

test("TRAIN category filter KRAFT shows only strength", async ({ page }) => {
  await page.goto("/train");
  await page.getByRole("button", { name: "KRAFT" }).click();
  const rows = page.locator("a[href^='/train/']");
  await expect(rows).toHaveCount(10);
});

test("TRAIN category filter MOBILITY shows only mobility", async ({ page }) => {
  await page.goto("/train");
  await page.getByRole("button", { name: "MOBILITY" }).click();
  const rows = page.locator("a[href^='/train/']");
  await expect(rows).toHaveCount(5);
});

test("TRAIN search + category combined filter works", async ({ page }) => {
  await page.goto("/train");
  await page.getByRole("button", { name: "CALISTHENICS" }).click();
  await page.getByPlaceholder("SEARCH EXERCISES").fill("burpee");
  const rows = page.locator("a[href^='/train/']");
  await expect(rows).toHaveCount(1);
});

test("TRAIN empty search result shows KEINE ERGEBNISSE", async ({ page }) => {
  await page.goto("/train");
  await page.getByPlaceholder("SEARCH EXERCISES").fill("xyznotfound");
  await expect(page.getByText("KEINE ERGEBNISSE")).toBeVisible();
});

// ─── TRAIN Detail ────────────────────────────────────────────────────────────

test("TRAIN detail page loads from list row click", async ({ page }) => {
  await page.goto("/train");
  await page.locator("a[href^='/train/']").first().click();
  await page.waitForURL(/\/train\/.+/);
  // Back bar present
  await expect(page.getByRole("link", { name: "TRAIN" }).first()).toBeVisible();
});

test("TRAIN detail page shows exercise name, steps, and CTA", async ({ page }) => {
  await page.goto("/train");
  const firstRow = page.locator("a[href^='/train/']").first();
  const exerciseName = await firstRow.locator("p.font-display").first().textContent();
  await firstRow.click();
  // Heading matches
  const heading = page.locator("h1");
  await expect(heading).toContainText(exerciseName?.trim() ?? "");
  // AUSFÜHRUNG section
  await expect(page.getByText("AUSFÜHRUNG")).toBeVisible();
  // CTA button
  await expect(page.getByRole("link", { name: "EXECUTE" })).toBeVisible();
});

test("TRAIN detail back link navigates to /train", async ({ page }) => {
  await page.goto("/train");
  await page.locator("a[href^='/train/']").first().click();
  await page.getByRole("link", { name: "TRAIN" }).first().click();
  await expect(page.url()).toContain("/train");
  await expect(page.getByRole("heading", { name: "TRAIN" })).toBeVisible();
});

test("TRAIN detail shows difficulty dots", async ({ page }) => {
  await page.goto("/train");
  await page.locator("a[href^='/train/']").first().click();
  await expect(page.getByText(/LEVEL \d/)).toBeVisible();
});

// ─── CHOW List ────────────────────────────────────────────────────────────────

test("CHOW page renders SecHero with correct title", async ({ page }) => {
  await page.goto("/chow");
  await expect(page.getByRole("heading", { name: "CHOW" })).toBeVisible();
  await expect(page.getByText("LIBRARY").first()).toBeVisible();
});

test("CHOW page shows 20 recipe rows", async ({ page }) => {
  await page.goto("/chow");
  const rows = page.locator("a[href^='/chow/']");
  await expect(rows).toHaveCount(20);
});

test("CHOW search filters recipes by name", async ({ page }) => {
  await page.goto("/chow");
  await page.getByPlaceholder("SEARCH RECIPES").fill("oat");
  const rows = page.locator("a[href^='/chow/']");
  const count = await rows.count();
  expect(count).toBeGreaterThanOrEqual(1);
  const names = await rows.allTextContents();
  expect(names.some((n) => n.toLowerCase().includes("oat"))).toBe(true);
});

test("CHOW tag filter PRE-WO shows only pre_wo recipes", async ({ page }) => {
  await page.goto("/chow");
  await page.getByRole("button", { name: "PRE-WO" }).click();
  const rows = page.locator("a[href^='/chow/']");
  // 6 recipes tagged pre_wo (some also tagged bulk/field_ready)
  await expect(rows).toHaveCount(6);
});

test("CHOW tag filter FIELD-READY shows only field_ready recipes", async ({ page }) => {
  await page.goto("/chow");
  await page.getByRole("button", { name: "FIELD-READY" }).click();
  const rows = page.locator("a[href^='/chow/']");
  // field_ready: 4 seeded (1 also tagged cut - Tuna Lettuce Wraps)
  const count = await rows.count();
  expect(count).toBeGreaterThanOrEqual(4);
});

test("CHOW tag filter CUT shows cut recipes", async ({ page }) => {
  await page.goto("/chow");
  await page.getByRole("button", { name: "CUT" }).click();
  const rows = page.locator("a[href^='/chow/']");
  const count = await rows.count();
  expect(count).toBeGreaterThanOrEqual(4);
});

test("CHOW empty search shows KEINE ERGEBNISSE", async ({ page }) => {
  await page.goto("/chow");
  await page.getByPlaceholder("SEARCH RECIPES").fill("xyznotfound");
  await expect(page.getByText("KEINE ERGEBNISSE")).toBeVisible();
});

// ─── CHOW Detail ─────────────────────────────────────────────────────────────

test("CHOW detail page loads from list row click", async ({ page }) => {
  await page.goto("/chow");
  await page.locator("a[href^='/chow/']").first().click();
  await page.waitForURL(/\/chow\/.+/);
  await expect(page.getByRole("main").getByRole("link", { name: "CHOW" })).toBeVisible();
});

test("CHOW detail shows macro strip with kcal", async ({ page }) => {
  await page.goto("/chow");
  await page.locator("a[href^='/chow/']").first().click();
  await expect(page.getByText("KALORIEN")).toBeVisible();
  await expect(page.getByText("PROTEIN", { exact: true })).toBeVisible();
});

test("CHOW detail shows ingredients and steps", async ({ page }) => {
  await page.goto("/chow");
  await page.locator("a[href^='/chow/']").first().click();
  await expect(page.getByText("ZUTATEN")).toBeVisible();
  await expect(page.getByText("ZUBEREITUNG")).toBeVisible();
});

test("CHOW detail shows LOG MEAL CTA", async ({ page }) => {
  await page.goto("/chow");
  await page.locator("a[href^='/chow/']").first().click();
  await expect(page.getByRole("link", { name: "LOG MEAL" })).toBeVisible();
});

test("CHOW detail back link navigates to /chow", async ({ page }) => {
  await page.goto("/chow");
  await page.locator("a[href^='/chow/']").first().click();
  await page.getByRole("link", { name: "CHOW" }).click();
  await expect(page.url()).toContain("/chow");
  await expect(page.getByRole("heading", { name: "CHOW" })).toBeVisible();
});

// ─── Mobile viewport ─────────────────────────────────────────────────────────

test("TRAIN list is usable at 375px width", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/train");
  await expect(page.getByRole("heading", { name: "TRAIN" })).toBeVisible();
  const rows = page.locator("a[href^='/train/']");
  await expect(rows.first()).toBeVisible();
});

test("CHOW list is usable at 375px width", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/chow");
  await expect(page.getByRole("heading", { name: "CHOW" })).toBeVisible();
  const rows = page.locator("a[href^='/chow/']");
  await expect(rows.first()).toBeVisible();
});
