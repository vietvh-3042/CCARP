import type { Locale } from "../i18n";
import type { OrderQuestion } from "../lib/lesson-checkpoints";
import { checkpointLabels } from "../lib/checkpoint-labels";
import type { CheckpointStore } from "./checkpoint-store";
import { isSolved } from "./checkpoint-state";
import { createFeedback } from "./checkpoint-feedback";
export function bindOrder(panel: HTMLElement, question: OrderQuestion, store: CheckpointStore, locale: Locale) {
  const list = panel.querySelector<HTMLOListElement>("[data-order-list]");
  const check = panel.querySelector<HTMLButtonElement>("[data-check-order]");
  if (!list || !check) throw Error(`Missing order controls ${question.id}`);
  const items = [...list.children] as HTMLLIElement[];
  if (items.length !== question.itemCount) throw Error(`Order item mismatch ${question.id}`);
  const labels = checkpointLabels(locale);
  check.textContent = labels.checkOrder;
  const feedback = createFeedback(
    panel,
    question,
    locale,
    question.correctOrder.map((index) => items[index].children[1]?.textContent?.trim() ?? ""),
  );
  const controls = items.map((item, index) => {
    item.dataset.orderItem = String(index);
    const buttons = [...item.querySelectorAll<HTMLButtonElement>("button")];
    if (buttons.length !== 2) throw Error(`Missing ordering arrows ${question.id}`);
    buttons.forEach((button, direction) => {
      button.dataset[direction === 0 ? "orderUp" : "orderDown"] = String(index);
      button.addEventListener("click", async () => {
        await store.update((state) => {
          const attempt = state.answers[question.id];
          if (isSolved(question, attempt)) return;
          const from = attempt.order.indexOf(index);
          const to = from + (direction === 0 ? -1 : 1);
          if (to < 0 || to >= attempt.order.length) return;
          [attempt.order[from], attempt.order[to]] = [attempt.order[to], attempt.order[from]];
          attempt.checked = false;
        });
        (button.disabled ? buttons[direction === 0 ? 1 : 0] : button).focus({ preventScroll: true });
      });
    });
    return buttons;
  });
  check.addEventListener("click", async () => {
    await store.update((state) => {
      state.answers[question.id].checked = true;
    });
    feedback.element.focus({ preventScroll: true });
  });
  store.subscribe(() => {
    const attempt = store.state.answers[question.id];
    const solved = isSolved(question, attempt);
    panel.dataset.solved = String(solved);
    attempt.order.forEach((originalIndex, position) => {
      const item = items[originalIndex];
      list.append(item);
      if (item.children[0]) item.children[0].textContent = `${position + 1}.`;
      controls[originalIndex].forEach((button, direction) => {
        button.hidden = solved;
        button.disabled = solved || (direction === 0 ? position === 0 : position === items.length - 1);
        button.setAttribute("aria-label", `${direction === 0 ? labels.up : labels.down}: ${position + 1}`);
      });
    });
    check.hidden = solved;
    check.disabled = solved;
    feedback.show(solved ? "correct" : attempt.checked ? "wrong" : "idle");
  });
}
