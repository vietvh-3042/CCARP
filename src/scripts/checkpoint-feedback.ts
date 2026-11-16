import type { Locale } from "../i18n";
import type { Question } from "../lib/lesson-checkpoints";
import { checkpointLabels } from "../lib/checkpoint-labels";
export function createFeedback(panel: HTMLElement, question: Question, locale: Locale, details: string[] = []) {
  const labels = checkpointLabels(locale);
  const element = document.createElement("div");
  element.className =
    "checkpoint-feedback mt-4 rounded-md border border-border bg-muted/40 p-4 text-sm leading-relaxed data-[result=correct]:border-primary/50 data-[result=wrong]:border-red-500/50";
  element.dataset.feedback = "";
  element.setAttribute("role", "status");
  element.setAttribute("aria-live", "polite");
  element.tabIndex = -1;
  element.hidden = true;
  (panel.querySelector<HTMLElement>("[data-question-body]") ?? panel).append(element);
  let last = "";
  return {
    element,
    show(status: "idle" | "wrong" | "correct" | "partial" | "prompt", note = "") {
      const signature = `${status}:${note}`;
      if (signature === last) return;
      last = signature;
      element.hidden = status === "idle";
      element.dataset.result = status;
      const message = document.createElement("p");
      message.textContent =
        status === "correct"
          ? labels.correct
          : status === "wrong"
            ? labels.wrong
            : status === "prompt"
              ? labels.chooseTerm
              : note;
      element.replaceChildren(message);
      if (status === "correct") {
        const list = document.createElement("ul");
        list.className = "mt-2 space-y-1 text-muted-foreground";
        for (const detail of details) {
          const item = document.createElement("li");
          item.textContent = detail;
          list.append(item);
        }
        const link = document.createElement("a");
        link.href = question.sourceUrl;
        link.textContent = labels.source;
        link.className = "mt-2 inline-block text-xs text-primary underline underline-offset-2";
        link.target = "_blank";
        link.rel = "noreferrer";
        element.append(list, link);
      }
    },
  };
}
export function makeOption(item: HTMLLIElement, attribute: string, index: number) {
  const text = item.textContent?.replace(/\s+/g, " ").trim() ?? "";
  const original = item.querySelector("button");
  const button = document.createElement("button");
  button.type = "button";
  button.className =
    "checkpoint-option w-full min-h-11 rounded-md border border-border bg-background p-3 text-left text-sm leading-relaxed text-foreground transition-colors hover:enabled:bg-muted/50 aria-pressed:border-primary data-[result=correct]:border-primary data-[result=correct]:bg-primary/10 data-[result=wrong]:border-red-500/70 data-[result=wrong]:bg-red-500/10 disabled:cursor-default";
  button.setAttribute(attribute, String(index));
  if (original) button.append(...[...original.childNodes].map((node) => node.cloneNode(true)));
  else button.textContent = text;
  item.replaceChildren(button);
  return button;
}
export const optionItems = (panel: HTMLElement) => [
  ...panel.querySelectorAll<HTMLLIElement>("[data-choice-options] > li"),
];
