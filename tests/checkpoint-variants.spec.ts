import { test, expect } from "@playwright/test";
import { panel, solveCurrentPage } from "./checkpoint-helpers";

test("code blank uses the verified model identifier and preserves code rendering", async ({ page }) => {
  await page.goto("/en/lessons/choosing-a-claude-model-lineup-trade-offs-and-starting-points/");
  const question = panel(page, 1);
  await question.locator("[data-option]", { hasText: /^claude-opus-5-5$/ }).click();
  await expect(question.locator("[data-feedback]")).toContainText("Correct");
  await expect(question.locator("[data-option]:enabled")).toHaveCount(0);
  await page.reload();
  await expect(question).toHaveAttribute("data-solved", "true");
});

test("multi-select requires exact selection count, supports retry and persists success", async ({ page }) => {
  await page.goto("/en/lessons/choosing-a-claude-model-lineup-trade-offs-and-starting-points/");
  const question = panel(page, 5);
  const check = question.locator("[data-check-answer]");
  await expect(check).toBeDisabled();
  for (const index of [0, 1, 4]) await question.locator(`[data-option="${index}"]`).click();
  await expect(check).toBeEnabled();
  await check.click();
  await expect(question.locator("[data-feedback]")).toContainText("Not quite");
  await expect(question.locator("[data-option]:enabled")).toHaveCount(5);
  await question.locator('[data-option="4"]').click();
  await expect(check).toBeDisabled();
  await question.locator('[data-option="2"]').click();
  await check.click();
  await expect(question.locator("[data-feedback]")).toContainText("Correct");
  await page.locator("[data-language-switch]").click();
  await expect(panel(page, 5)).toHaveAttribute("data-solved", "true");
  await expect(panel(page, 5).locator("[data-feedback]")).toContainText("Chính xác");
});

test("order controls grade the canonical injection-check sequence and survive reload", async ({ page }) => {
  await page.goto(
    "/en/lessons/guardrails-for-claude-apps-jailbreaks-prompt-injection-hallucinations-and-prompt-leaks/",
  );
  const question = panel(page, 4);
  const list = question.locator("[data-order-list]");
  const canonical = ["Run the tool", "Pass the raw output", "Read the classifier", "Return the raw content"];
  await question.locator("[data-check-order]").click();
  await expect(question.locator("[data-feedback]")).toContainText("Not quite");
  for (const [position, text] of canonical.entries()) {
    const item = list.locator(":scope > li").filter({ hasText: text });
    while ((await item.evaluate((node) => [...node.parentElement!.children].indexOf(node))) > position) {
      const before = await item.evaluate((node) => [...node.parentElement!.children].indexOf(node));
      await item.locator("[data-order-up]").click();
      await expect
        .poll(() => item.evaluate((node) => [...node.parentElement!.children].indexOf(node)))
        .toBe(before - 1);
    }
  }
  await question.locator("[data-check-order]").click();
  await expect(question.locator("[data-feedback]")).toContainText("Correct");
  await expect(question.locator("[data-order-up]:visible")).toHaveCount(0);
  await page.reload();
  await expect(question).toHaveAttribute("data-solved", "true");
  for (const [position, text] of canonical.entries())
    await expect(list.locator(":scope > li").nth(position)).toContainText(text);
});

test("answers synchronize across tabs without clearing another page's progress", async ({ page, context }) => {
  await page.goto("/en/lessons/from-business-problem-to-claude-solution-design/");
  const other = await context.newPage();
  await other.goto("/vi/lessons/from-business-problem-to-claude-solution-design/");
  await panel(page, 1).locator('[data-option="3"]').click();
  await expect(panel(other, 1)).toHaveAttribute("data-solved", "true");
  await panel(other, 2).locator('[data-option="2"]').click();
  await expect(page.locator(".lesson-header [data-checkpoint-summary]")).toHaveText("2/9");
  await other.close();
});

test("a two-part lesson needs both pages and the library resumes the unfinished part", async ({ page }) => {
  await page.goto("/en/lessons/multi-agent-system-design-when-to-split-and-how-to-decompose/");
  await solveCurrentPage(page);
  await expect(page.locator("[data-complete]")).toBeDisabled();
  await expect(page.locator("[data-completion-hint]")).toContainText("remaining parts");
  await page.goto("/en/");
  const card = page.locator('[data-library-group="1.4"]');
  await expect(card).toHaveAttribute(
    "href",
    "/en/lessons/multi-agent-orchestration-in-managed-agents-the-agent-sdk-and-claude-code/#continue",
  );
  await expect(card.locator("[data-library-progress]")).toContainText("checkpoints");
  await card.click();
  await solveCurrentPage(page);
  await expect(page.locator("[data-complete]")).toBeEnabled();
  await page.locator("[data-complete]").click();
  await expect(page.locator("[data-complete]")).toHaveAttribute("aria-pressed", "true");
  await page.goto("/vi/lessons/multi-agent-system-design-when-to-split-and-how-to-decompose/");
  await expect(page.locator("[data-complete]")).toHaveAttribute("aria-pressed", "true");
  await page.locator("[data-complete]").click();
  await expect(page.locator("[data-complete]")).toHaveAttribute("aria-pressed", "false");
  await page.goto("/en/lessons/multi-agent-orchestration-in-managed-agents-the-agent-sdk-and-claude-code/");
  await expect(page.locator("[data-complete]")).toHaveAttribute("aria-pressed", "false");
});

test("delayed tab notifications cannot overwrite another checkpoint answer", async ({ page, context }) => {
  await page.addInitScript(() => window.addEventListener("storage", (event) => event.stopImmediatePropagation(), true));
  await page.goto("/en/lessons/from-business-problem-to-claude-solution-design/");
  const other = await context.newPage();
  await other.addInitScript(() =>
    window.addEventListener("storage", (event) => event.stopImmediatePropagation(), true),
  );
  await other.goto("/vi/lessons/from-business-problem-to-claude-solution-design/");
  await panel(page, 1).locator('[data-option="3"]').click();
  await expect(panel(page, 1)).toHaveAttribute("data-solved", "true");
  await panel(other, 2).locator('[data-option="2"]').click();
  await expect(panel(other, 2)).toHaveAttribute("data-solved", "true");
  await page.reload();
  await expect(page.locator(".lesson-header [data-checkpoint-summary]")).toHaveText("2/9");
  await expect(panel(page, 1)).toHaveAttribute("data-solved", "true");
  await expect(panel(page, 2)).toHaveAttribute("data-solved", "true");
  await other.close();
});

test("expanded trap explanations address the actual claim in both languages", async ({ page }) => {
  await page.goto("/en/lessons/from-business-problem-to-claude-solution-design/");
  const trap = page.locator("#exam-trap-4 details");
  await trap.locator("summary").click();
  await expect(trap.locator("[data-explanation]")).toContainText("distinct jobs");
  await page.locator("[data-language-switch]").click();
  await page.locator("#exam-trap-4 summary").click();
  await expect(page.locator("#exam-trap-4 [data-explanation]")).toContainText("nhiều việc riêng");
  await page.goto("/en/lessons/sharing-claude-code-workflows-claude-md-skills-hooks-and-ci/");
  const hint = page.locator('[data-explanation="nudge-1"]');
  await hint.locator("..").locator("summary").click();
  await expect(hint).toContainText("matcher");
});
