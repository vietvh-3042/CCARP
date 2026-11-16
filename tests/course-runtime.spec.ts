import { test, expect } from "@playwright/test";
import pages from "../src/data/course-pages.json" with { type: "json" };
for (const domain of [1, 2, 3, 4, 5, 6, 7]) {
  test(`every domain ${domain} page initializes all questions in both languages`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const entry of pages.filter((entry) => entry.domain === domain)) {
      for (const locale of ["en", "vi"]) {
        const route = `/${locale}/lessons/${entry.sourceSlug}/`;
        expect((await page.goto(route))?.status(), route).toBe(200);
        await expect(page.locator(".question[data-solved]")).toHaveCount(entry.checkpointCount);
        await expect(page.locator("[data-complete]")).toBeDisabled();
        expect(await page.locator(".question button:enabled").count(), route).toBeGreaterThan(0);
        expect(errors, route).toEqual([]);
      }
    }
  });
}
