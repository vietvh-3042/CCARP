import { test, expect } from "@playwright/test";
import { panel, solveAll } from "./checkpoint-helpers";
const lesson = "/en/lessons/from-business-problem-to-claude-solution-design/";

test("single choice grades immediately, permits correction and survives language/reload", async ({ page }) => {
  await page.goto(lesson);
  const question = panel(page, 1);
  await expect(question.locator("[data-option]")).toHaveCount(4, { timeout: 1500 });
  await question.locator('[data-option="0"]').click();
  await expect(question.locator("[data-feedback]")).toContainText("Not quite");
  await expect(question.locator('[data-option="0"]')).toBeDisabled();
  await expect(page.locator(".lesson-header [data-checkpoint-summary]")).toHaveText("0/9");
  await question.locator('[data-option="3"]').click();
  await expect(question.locator("[data-feedback]")).toContainText("Correct");
  await expect(question.locator("button:enabled")).toHaveCount(0);
  await expect(page.locator(".lesson-header [data-checkpoint-summary]")).toHaveText("1/9");
  await page.goto(`${lesson}#checkpoint-1`);
  await page.locator("[data-language-switch]").click();
  await expect(page).toHaveURL(/\/vi\/lessons\/from-business-problem-to-claude-solution-design\/#checkpoint-1$/);
  await expect(panel(page, 1).locator("[data-feedback]")).toContainText("Chính xác");
  await page.reload();
  await expect(page.locator(".lesson-header [data-checkpoint-summary]")).toHaveText("1/9");
  await page.goto("/en/lessons/1.1/#checkpoint-1");
  await expect(page).toHaveURL(/\/en\/lessons\/from-business-problem-to-claude-solution-design\/#checkpoint-1$/);
  await expect(panel(page, 1)).toHaveAttribute("data-solved", "true");
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("ccarpp-learning-v2")!));
  expect(Object.keys(stored.lessons)).toEqual(["1.1"]);
});

test("matching retains selected term after an error, locks correct pairs, counts only a solved panel", async ({
  page,
}) => {
  await page.goto(lesson);
  const question = panel(page, 3);
  await expect(question.locator("[data-term]")).toHaveCount(3, { timeout: 1500 });
  await question.locator('[data-term="0"]').click();
  await question.locator('[data-definition="0"]').click();
  await expect(question.locator("[data-feedback]")).toContainText("Not quite");
  await expect(question.locator('[data-term="0"]')).toHaveAttribute("aria-pressed", "true");
  await question.locator('[data-definition="1"]').click();
  await expect(question.locator('[data-term="0"]')).toBeDisabled();
  await expect(question.locator('[data-definition="1"]')).toBeDisabled();
  await expect(page.locator(".lesson-header [data-checkpoint-summary]")).toHaveText("0/9");
  await page.reload();
  await expect(question.locator('[data-term="0"]')).toBeDisabled();
  for (const [term, definition] of [
    [1, 0],
    [2, 2],
  ]) {
    await question.locator(`[data-term="${term}"]`).click();
    await question.locator(`[data-definition="${definition}"]`).click();
  }
  await expect(question.locator("[data-feedback]")).toContainText("Correct");
  await expect(page.locator(".lesson-header [data-checkpoint-summary]")).toHaveText("1/9");
});

test("finishing requires all nine correct checkpoints and ignores old reading completion", async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("ccarpp-reading-v1", JSON.stringify({ version: 1, completed: ["1.1"] })),
  );
  await page.goto(lesson);
  const finish = page.locator("[data-complete]");
  await expect(finish).toBeDisabled({ timeout: 1500 });
  await solveAll(page);
  await expect(page.locator(".lesson-header [data-checkpoint-summary]")).toHaveText("9/9");
  await expect(finish).toBeEnabled();
  await finish.click();
  await expect(finish).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(finish).toHaveAttribute("aria-pressed", "true");
});
