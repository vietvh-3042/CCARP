import type { Locale } from "../i18n";
import type { ChoiceQuestion } from "../lib/lesson-checkpoints";
import type { CheckpointStore } from "./checkpoint-store";
import { isSolved } from "./checkpoint-state";
import { createFeedback, makeOption, optionItems } from "./checkpoint-feedback";
export function bindChoice(panel: HTMLElement, question: ChoiceQuestion, store: CheckpointStore, locale: Locale) {
  const items = optionItems(panel);
  if (items.length !== question.optionCount) throw new Error(`Option count mismatch for ${question.id}`);
  const feedback = createFeedback(panel, question, locale, [items[question.answerIndex].textContent?.trim() ?? ""]);
  panel.classList.add("checkpoint-enhanced");
  const buttons = items.map((item, index) => {
    const button = makeOption(item, "data-option", index);
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", async () => {
      if (button.disabled) return;
      await store.update((state) => {
        const attempt = state.answers[question.id];
        if (isSolved(question, attempt)) return;
        attempt.selected = index;
        if (index !== question.answerIndex && !attempt.rejected.includes(index)) attempt.rejected.push(index);
      });
      if (index === question.answerIndex) feedback.element.focus({ preventScroll: true });
      else buttons.find((option) => !option.disabled)?.focus({ preventScroll: true });
    });
    return button;
  });
  store.subscribe(() => {
    const attempt = store.state.answers[question.id];
    const solved = isSolved(question, attempt);
    panel.dataset.solved = String(solved);
    buttons.forEach((button, index) => {
      button.disabled = solved || attempt.rejected.includes(index);
      button.setAttribute("aria-pressed", String(attempt.selected === index));
      button.dataset.result =
        solved && index === question.answerIndex ? "correct" : attempt.rejected.includes(index) ? "wrong" : "idle";
    });
    feedback.show(solved ? "correct" : attempt.selected !== undefined ? "wrong" : "idle");
  });
}
