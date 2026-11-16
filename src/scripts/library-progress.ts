import type { GroupRequirement } from "../lib/lesson-checkpoints";
import { normalizeLesson, isSolved, isRecord } from "./checkpoint-state";
import { checkpointStorageKey } from "./checkpoint-store";
import type { Locale } from "../i18n";
export function initLibraryProgress() {
  const element = document.querySelector("#library-progress-data");
  if (!element) return;
  const data = JSON.parse(element.textContent ?? "{}") as {
    locale: Locale;
    groups: { id: string; pages: (GroupRequirement & { url: string })[] }[];
  };
  const update = () => {
    let stored: Record<string, unknown> = {};
    try {
      const value: unknown = JSON.parse(localStorage.getItem(checkpointStorageKey) ?? "null");
      if (isRecord(value) && value.version === 2 && isRecord(value.lessons)) stored = value.lessons;
    } catch {
      /* Reading remains available when storage is blocked. */
    }
    for (const group of data.groups) {
      const card = document.querySelector<HTMLAnchorElement>(`[data-library-group="${group.id}"]`);
      let count = 0,
        total = 0,
        next: string | undefined;
      for (const page of group.pages) {
        const state = normalizeLesson(stored[page.lessonId], page.revision, [...page.questions, ...page.predictions]);
        const solved = page.questions.filter((question) => isSolved(question, state.answers[question.id])).length;
        count += solved;
        total += page.questions.length;
        if (solved < page.questions.length && !next) next = page.url;
      }
      const ring = card?.querySelector("[data-progress-ring]");
      ring?.setAttribute("stroke-dashoffset", String(62.832 * (1 - (total ? count / total : 0))));
      const label = card?.querySelector("[data-library-progress]");
      if (label)
        label.textContent = count
          ? ` · ${count}/${total} ${data.locale === "en" ? "checkpoints" : "câu kiểm tra"}`
          : "";
      if (card) card.href = `${next ?? group.pages[0].url}#continue`;
    }
  };
  update();
  window.addEventListener("storage", update);
  window.addEventListener("pageshow", update);
}
