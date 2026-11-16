import { test, expect } from "@playwright/test";

const parts = [
  ["1.4", "multi-agent-system-design-when-to-split-and-how-to-decompose"],
  ["1.4.2", "multi-agent-orchestration-in-managed-agents-the-agent-sdk-and-claude-code"],
] as const;

for (const locale of ["en", "vi"]) {
  for (const [id, slug] of parts) {
    test(`${locale} numeric URL ${id} adopts its canonical slug, retaining query and fragment`, async ({ page }) => {
      await page.goto(`/${locale}/lessons/${id}/?ref=bookmark#section-2`);
      await expect(page).toHaveURL(`/${locale}/lessons/${slug}/?ref=bookmark#section-2`);
      await expect(page.locator("#section-2")).toBeInViewport();
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      const alternate = locale === "en" ? "vi" : "en";
      await expect(page.locator("[data-language-switch]")).toHaveAttribute(
        "href",
        new RegExp(`/${alternate}/lessons/${slug}/#section-2$`),
      );
      await expect(page.locator('#course-navigation a[aria-current="page"]').last()).toHaveAttribute(
        "href",
        `/${locale}/lessons/${slug}/`,
      );
    });
  }
}

test("source slug aliases retain fragments and point straight at canonical pages", async ({ page }) => {
  await page.goto(
    "/anthropic/claude-architect-professional/learn/multi-agent-system-design-when-to-split-and-how-to-decompose/?ref=source#checkpoint-1",
  );
  await expect(page).toHaveURL(
    "/en/lessons/multi-agent-system-design-when-to-split-and-how-to-decompose/?ref=source#checkpoint-1",
  );
  await expect(page.locator("#checkpoint-1")).toBeInViewport();
});

test("numeric bookmarks retain their reading position without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/vi/lessons/1.4/?ref=bookmark#section-2");
  await expect(page).toHaveURL("/vi/lessons/1.4/?ref=bookmark#section-2");
  await expect(page.locator("#section-2")).toBeInViewport();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "/vi/lessons/multi-agent-system-design-when-to-split-and-how-to-decompose/",
  );
  await expect(page.locator(".prose [data-lesson-section]")).not.toHaveCount(0);
  await context.close();
});
