import type { Locale } from "../i18n";
import type { MatchQuestion } from "../lib/lesson-checkpoints";
import { checkpointLabels } from "../lib/checkpoint-labels";
import type { CheckpointStore } from "./checkpoint-store";
import { isSolved } from "./checkpoint-state";
import { createFeedback, makeOption } from "./checkpoint-feedback";
export function bindMatching(panel: HTMLElement, question: MatchQuestion, store: CheckpointStore, locale: Locale) {
  const left = [...panel.querySelectorAll<HTMLLIElement>("[data-term-list] > li")];
  const right = [...panel.querySelectorAll<HTMLLIElement>("[data-definition-list] > li")];
  if (left.length !== question.pairs.length || right.length !== question.pairs.length)
    throw new Error(`Pair count mismatch for ${question.id}`);
  const labels = checkpointLabels(locale);
  const feedback = createFeedback(
    panel,
    question,
    locale,
    question.pairs.map(
      (definition, index) => `${left[index].textContent?.trim()} ↔ ${right[definition].textContent?.trim()}`,
    ),
  );
  panel.classList.add("checkpoint-enhanced");
  const terms = left.map((item, index) => {
    const button = makeOption(item, "data-term", index);
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () =>
      store.update((state) => {
        state.answers[question.id].selected = index;
        state.answers[question.id].wrong = undefined;
      }),
    );
    return button;
  });
  const definitions = right.map((item, index) => {
    const button = makeOption(item, "data-definition", index);
    button.addEventListener("click", async () => {
      let correct = false;
      let missing = false;
      await store.update((state) => {
        const attempt = state.answers[question.id];
        const selected = attempt.selected;
        if (selected === undefined) {
          missing = true;
          return;
        }
        correct = question.pairs[selected] === index;
        if (correct) {
          attempt.pairs[selected] = index;
          attempt.selected = undefined;
          attempt.wrong = undefined;
        } else attempt.wrong = index;
      });
      if (missing) feedback.show("prompt");
      if (correct) (terms.find((term) => !term.disabled) ?? feedback.element).focus({ preventScroll: true });
    });
    return button;
  });
  store.subscribe(() => {
    const attempt = store.state.answers[question.id];
    const solved = isSolved(question, attempt);
    const count = attempt.pairs.filter((value) => value !== -1).length;
    panel.dataset.solved = String(solved);
    terms.forEach((button, index) => {
      button.disabled = attempt.pairs[index] !== -1;
      button.setAttribute("aria-pressed", String(attempt.selected === index));
      button.dataset.result = button.disabled ? "correct" : "idle";
    });
    definitions.forEach((button, index) => {
      button.disabled = attempt.pairs.includes(index);
      button.dataset.result = button.disabled ? "correct" : attempt.wrong === index ? "wrong" : "idle";
    });
    feedback.show(
      solved ? "correct" : attempt.wrong !== undefined ? "wrong" : count > 0 ? "partial" : "idle",
      labels.partial.replace("{count}", String(count)).replace("{total}", String(question.pairs.length)),
    );
  });
}
