import { ui, type Locale } from "../i18n";
import { checkpointLabels } from "../lib/checkpoint-labels";
import type { Question } from "../lib/lesson-checkpoints";
import type { CheckpointStore } from "./checkpoint-store";
import { isSolved } from "./checkpoint-state";
export function initProgress(main: HTMLElement, store: CheckpointStore, questions: Question[], locale: Locale) {
  const labels = checkpointLabels(locale);
  const t = ui[locale];
  const button = main.querySelector<HTMLButtonElement>("[data-complete]");
  const status = main.querySelector<HTMLElement>("[data-storage-status]");
  const hint = main.querySelector<HTMLElement>("[data-completion-hint]");
  if (!button || !status || !hint) throw new Error("Lesson completion controls missing");
  button.hidden = false;
  main.querySelectorAll<HTMLElement>(".checkpoint-dots").forEach((group) => {
    const links = questions.map((question, index) => {
      const link = document.createElement("a");
      link.href = `#${question.id}`;
      link.dataset.checkpointDot = question.id;
      link.setAttribute("aria-label", labels.jump.replace("{number}", String(index + 1)));
      return link;
    });
    group.replaceChildren(...links);
  });
  const nextLinks = questions.map((question) => {
    const panel = main.querySelector<HTMLElement>(`#${question.id}`)?.closest<HTMLElement>(".question");
    const link = document.createElement("a");
    link.dataset.nextCheckpoint = question.id;
    link.className = "checkpoint-next mt-4 inline-block text-xs text-primary underline-offset-2 hover:underline";
    panel?.append(link);
    return link;
  });
  button.addEventListener("click", () => {
    if (!store.canFinish) return;
    store.setCompleted(!store.completed);
  });
  store.subscribe(() => {
    const count = store.solvedCount;
    const remaining = store.total - count;
    button.disabled = !store.canFinish;
    button.setAttribute("aria-pressed", String(store.completed));
    button.textContent = store.completed ? t.completed : t.read;
    status.textContent = store.persistent ? t.saved : t.memory;
    hint.textContent = store.completed
      ? labels.finished
      : remaining
        ? labels.remaining.replace("{count}", String(remaining))
        : store.canFinish
          ? labels.ready
          : labels.otherParts;
    main.querySelectorAll<HTMLElement>("[data-checkpoint-summary]").forEach((counter) => {
      counter.textContent = `${count}/${store.total}`;
    });
    main.querySelectorAll<HTMLElement>("[data-checkpoint-dot]").forEach((dot) => {
      const question = questions.find((item) => item.id === dot.dataset.checkpointDot);
      if (question) dot.dataset.solved = String(isSolved(question, store.state.answers[question.id]));
    });
    const next = questions.find((question) => !isSolved(question, store.state.answers[question.id]));
    nextLinks.forEach((link, index) => {
      const question = questions[index];
      link.hidden = !isSolved(question, store.state.answers[question.id]);
      link.textContent = next ? `${remaining} · ${labels.next} →` : labels.allDone;
      link.href = next ? `#${next.id}` : "#lesson-completion";
    });
  });
}
