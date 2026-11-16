import type { Locale } from "../i18n";
import type { MultiQuestion } from "../lib/lesson-checkpoints";
import { checkpointLabels } from "../lib/checkpoint-labels";
import type { CheckpointStore } from "./checkpoint-store";
import { isSolved } from "./checkpoint-state";
import { createFeedback, makeOption, optionItems } from "./checkpoint-feedback";
export function bindMulti(panel: HTMLElement, question: MultiQuestion, store: CheckpointStore, locale: Locale) {
  const items = optionItems(panel);
  if (items.length !== question.optionCount) throw Error(`Multi option mismatch ${question.id}`);
  const labels = checkpointLabels(locale);
  const check = panel.querySelector<HTMLButtonElement>("[data-check-answer]");
  if (!check) throw Error(`Missing multi submit ${question.id}`);
  check.textContent = labels.check;
  const feedback = createFeedback(
    panel,
    question,
    locale,
    question.answerIndices.map((index) => items[index].textContent?.trim() ?? ""),
  );
  const count = document.createElement("span");
  count.className = "ml-3 text-xs text-muted-foreground";
  count.dataset.selectionCount = "";
  check.parentElement?.querySelectorAll(":scope > span").forEach((span) => span.remove());
  check.after(count);
  const buttons = items.map((item, index) => {
    const button = makeOption(item, "data-option", index);
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () =>
      store.update((state) => {
        const attempt = state.answers[question.id];
        if (isSolved(question, attempt)) return;
        attempt.choices = attempt.choices.includes(index)
          ? attempt.choices.filter((value) => value !== index)
          : [...attempt.choices, index];
        attempt.checked = false;
      }),
    );
    return button;
  });
  check.addEventListener("click", async () => {
    if (check.disabled) return;
    await store.update((state) => {
      state.answers[question.id].checked = true;
    });
    feedback.element.focus({ preventScroll: true });
  });
  store.subscribe(() => {
    const attempt = store.state.answers[question.id];
    const solved = isSolved(question, attempt);
    panel.dataset.solved = String(solved);
    buttons.forEach((button, index) => {
      button.disabled = solved;
      button.setAttribute("aria-pressed", String(attempt.choices.includes(index)));
      button.dataset.result =
        attempt.checked && attempt.choices.includes(index)
          ? question.answerIndices.includes(index)
            ? "correct"
            : "wrong"
          : "idle";
    });
    check.disabled = solved || attempt.choices.length !== question.answerIndices.length;
    count.textContent = labels.selected
      .replace("{count}", String(attempt.choices.length))
      .replace("{total}", String(question.answerIndices.length));
    feedback.show(solved ? "correct" : attempt.checked ? "wrong" : "idle");
  });
}
