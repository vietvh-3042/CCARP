import type { Locale } from "../i18n";
import type { LessonCheckpoints, GroupRequirement } from "../lib/lesson-checkpoints";
import { createCheckpointStore } from "./checkpoint-store";
import { bindChoice } from "./checkpoint-choice";
import { bindMatching } from "./checkpoint-match";
import { bindMulti } from "./checkpoint-multi";
import { bindOrder } from "./checkpoint-order";
import { initProgress } from "./reading-progress";
export function initCheckpoints(element: HTMLElement) {
  const main = element.closest<HTMLElement>("main");
  const payload = element.querySelector<HTMLScriptElement>("[data-checkpoint-config]");
  if (!main || !payload?.textContent) return;
  const data = JSON.parse(payload.textContent) as LessonCheckpoints & { groupRequirements: GroupRequirement[] };
  const locale: Locale = element.dataset.locale === "vi" ? "vi" : "en";
  const store = createCheckpointStore(
    data.lessonId,
    data.groupId,
    data.revision,
    [...data.questions, ...data.predictions],
    data.groupRequirements,
  );
  for (const question of data.questions) {
    const heading = main.querySelector<HTMLElement>(`#${question.id}`);
    const panel = heading?.closest<HTMLElement>(".question");
    if (!heading || !panel) throw Error(`Checkpoint missing: ${question.id}`);
    heading.tabIndex = -1;
    panel.setAttribute("role", "group");
    panel.setAttribute("aria-labelledby", question.id);
    if (question.type === "choice") bindChoice(panel, question, store, locale);
    else if (question.type === "match") bindMatching(panel, question, store, locale);
    else if (question.type === "multi") bindMulti(panel, question, store, locale);
    else bindOrder(panel, question, store, locale);
  }
  for (const question of data.predictions) {
    const panel = main.querySelector<HTMLElement>(`[data-practice-id="${question.id}"]`);
    if (panel && question.type === "choice") bindChoice(panel, question, store, locale);
  }
  initProgress(main, store, data.questions, locale);
  if (location.hash === "#continue") {
    const next = data.questions.find(
      (question) =>
        !main.querySelector(`[data-checkpoint-panel="${question.id}"]`)?.getAttribute("data-solved")?.includes("true"),
    );
    if (next) main.querySelector(`#${next.id}`)?.scrollIntoView({ block: "start" });
  }
}
