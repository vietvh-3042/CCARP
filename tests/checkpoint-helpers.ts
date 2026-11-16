import { expect, type Page } from "@playwright/test";

// Independent oracle: source payload and live interactions verified 2026-11-16.
export const choiceAnswers = [
  [1, 3],
  [2, 2],
  [5, 1],
  [6, 1],
  [7, 2],
  [8, 1],
  [9, 2],
] as const;
export const matchAnswers = [
  [3, [1, 0, 2]],
  [4, [2, 0, 1]],
] as const;
export const panel = (page: Page, number: number) => page.locator(`.question:has(#checkpoint-${number})`);
export async function solveAll(page: Page) {
  for (const [number, answer] of choiceAnswers) {
    const button = panel(page, number).locator(`[data-option="${answer}"]`);
    if (!(await button.isDisabled())) await button.click();
  }
  for (const [number, pairs] of matchAnswers) {
    for (const [term, definition] of pairs.entries()) {
      const button = panel(page, number).locator(`[data-term="${term}"]`);
      if (await button.isDisabled()) continue;
      await button.click();
      await panel(page, number).locator(`[data-definition="${definition}"]`).click();
    }
  }
}

// This helper only exercises completion gating; answer correctness has independent source-oracle tests.
export async function solveCurrentPage(page: Page) {
  const data = JSON.parse((await page.locator("[data-checkpoint-config]").textContent()) ?? "{}");
  for (const question of data.questions) {
    const root = page.locator(`[data-checkpoint-panel="${question.id}"]`);
    if (question.type === "choice") await root.locator(`[data-option="${question.answerIndex}"]`).click();
    else if (question.type === "multi") {
      for (const index of question.answerIndices) await root.locator(`[data-option="${index}"]`).click();
      await root.locator("[data-check-answer]").click();
    } else if (question.type === "match") {
      for (const [term, definition] of question.pairs.entries()) {
        await root.locator(`[data-term="${term}"]`).click();
        await root.locator(`[data-definition="${definition}"]`).click();
      }
    } else {
      for (const [position, original] of question.correctOrder.entries()) {
        const item = root.locator(`[data-order-item="${original}"]`);
        while ((await item.evaluate((node) => [...node.parentElement!.children].indexOf(node))) > position) {
          const before = await item.evaluate((node) => [...node.parentElement!.children].indexOf(node));
          await item.locator("[data-order-up]").click();
          await expect
            .poll(() => item.evaluate((node) => [...node.parentElement!.children].indexOf(node)))
            .toBe(before - 1);
        }
      }
      await root.locator("[data-check-order]").click();
    }
  }
}
