import { test, expect } from "@playwright/test";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { parse } from "yaml";
import pages from "../src/data/course-pages.json" with { type: "json" };
const lesson = "/en/lessons/from-business-problem-to-claude-solution-design/";
const key = "ccarpp-learning-v2";

test("all 53 pages have bilingual content, stable anchors and built source aliases", () => {
  expect(pages).toHaveLength(53);
  for (const locale of ["en", "vi"]) {
    expect(readdirSync(`src/content/lessons/${locale}`).filter((file) => file.endsWith(".md"))).toHaveLength(53);
    for (const page of pages) {
      const text = readFileSync(`src/content/lessons/${locale}/${page.filename}.md`, "utf8");
      const meta = parse(text.match(/^---\n([\s\S]*?)\n---/)![1]);
      expect(meta.locale).toBe(locale);
      expect(meta.lessonId).toBe(page.lessonId);
      expect(meta.sections.map((section: { id: string }) => section.id)).toEqual(page.sections.map((s) => s.id));
      expect(text.match(/id="checkpoint-\d+"/g) ?? []).toHaveLength(page.checkpointCount);
      expect(existsSync(`dist/${locale}/lessons/${page.sourceSlug}/index.html`)).toBe(true);
      expect(existsSync(`dist/anthropic/claude-architect-professional/learn/${page.sourceSlug}/index.html`)).toBe(true);
    }
  }
});

test("library exposes every lesson and source paths resolve locally", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Tiếng Việt", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
  await expect(page.locator(".lesson-card")).toHaveCount(38);
  await expect(page.locator(".pending-lesson")).toHaveCount(0);
  await page.locator(".lesson-card").first().click();
  await expect(page).toHaveURL(/\/vi\/lessons\/from-business-problem-to-claude-solution-design\/#continue$/);
  await expect(page.locator(".question")).toHaveCount(9);
  await page.goto("/anthropic/claude-architect-professional/learn/from-business-problem-to-claude-solution-design/");
  await expect(page).toHaveURL(/\/en\/lessons\/from-business-problem-to-claude-solution-design\/$/);
  expect((await page.goto("/vi/lessons/99.99/"))?.status()).toBe(404);
});

test("language switch preserves any lesson and section through reload", async ({ page }) => {
  await page.goto("/en/lessons/reading-claude-code-errors-retries-and-multiagent-session-traces/#section-2");
  await page.locator("[data-language-switch]").click();
  await expect(page).toHaveURL(
    /\/vi\/lessons\/reading-claude-code-errors-retries-and-multiagent-session-traces\/#section-2$/,
  );
  await expect(page.locator("#section-2")).toBeInViewport();
  await page.reload();
  await expect(page.locator("#section-2")).toBeInViewport();
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
});

for (const data of ["{broken", '{"version":2,"lessons":false}', '{"version":2,"lessons":{"1.1":{"answers":null}}}']) {
  test(`invalid stored progress recovers: ${data}`, async ({ page }) => {
    await page.addInitScript(({ key, data }) => localStorage.setItem(key, data), { key, data });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(lesson);
    await page.locator('.question:has(#checkpoint-1) [data-option="3"]').click();
    await expect(page.locator(".lesson-header [data-checkpoint-summary]")).toHaveText("1/9");
    await expect(page.locator("[data-complete]")).toBeDisabled();
    expect(errors).toEqual([]);
  });
}

for (const operation of ["getItem", "setItem"] as const) {
  test(`storage ${operation} failure retains in-memory answers`, async ({ page }) => {
    await page.addInitScript((operation) => {
      Storage.prototype[operation] = () => {
        throw new DOMException("denied", "SecurityError");
      };
    }, operation);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(lesson);
    await page.locator('.question:has(#checkpoint-1) [data-option="3"]').click();
    await expect(page.locator(".lesson-header [data-checkpoint-summary]")).toHaveText("1/9");
    await expect(page.locator("[data-storage-status]")).toContainText("this visit only");
    expect(errors).toEqual([]);
  });
}

test("mobile navigation supports keyboard and the page fits its viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/vi/lessons/from-business-problem-to-claude-solution-design/");
  const menu = page.locator(".mobile-menu");
  await menu.focus();
  await page.keyboard.press("Enter");
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "plans/reports/course-mobile.png" });
});

test("desktop keeps sidebar and reading column aligned to source screenshots", async ({ page }) => {
  await page.setViewportSize({ width: 2560, height: 1440 });
  await page.goto(lesson);
  const bounds = await page.locator(".lesson-main").boundingBox();
  expect(bounds?.x).toBe(1044);
  expect(bounds?.width).toBe(768);
  await expect(page.locator(".lesson-badges")).toContainText("Published 19 Oct 2026");
  await expect(page.locator(".question")).toHaveCount(9);
  await expect(page.locator(".matching-columns")).toHaveCount(2);
  await page.screenshot({ path: "plans/reports/course-desktop.png" });
});

test("mobile reading and language links work without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(lesson);
  await expect(page.locator("#course-navigation")).toBeVisible();
  await expect(page.locator(".mobile-menu")).toBeHidden();
  await expect(page.locator("[data-complete]")).toBeHidden();
  await expect(page.locator(".question button:enabled")).toHaveCount(0);
  await page.locator("[data-language-switch]").click();
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
  await expect(page.locator(".prose [data-lesson-section]")).toHaveCount(6);
  await context.close();
});

test("header search filters the complete library", async ({ page }) => {
  await page.goto("/en/?q=claude");
  expect(await page.locator(".lesson-card:visible").count()).toBeGreaterThan(1);
  await page.goto("/en/?q=unmatched-phrase");
  await expect(page.locator(".lesson-card:visible")).toHaveCount(0);
  await expect(page.locator("[data-search-empty]")).toBeVisible();
});
