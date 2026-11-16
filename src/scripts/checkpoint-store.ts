import type { Question, GroupRequirement } from "../lib/lesson-checkpoints";
import { isRecord, isSolved, normalizeLesson, type LessonState } from "./checkpoint-state";
export const checkpointStorageKey = "ccarpp-learning-v2";
interface Document {
  version: 2;
  lessons: Record<string, unknown>;
  completedGroups: string[];
}
function parseDocument(raw: string | null): Document {
  try {
    const data: unknown = JSON.parse(raw ?? "null");
    if (isRecord(data) && data.version === 2 && isRecord(data.lessons))
      return {
        version: 2,
        lessons: data.lessons,
        completedGroups: Array.isArray(data.completedGroups)
          ? data.completedGroups.filter((id): id is string => typeof id === "string")
          : [],
      };
  } catch {}
  return { version: 2, lessons: {}, completedGroups: [] };
}
export function createCheckpointStore(
  id: string,
  groupId: string,
  revision: string,
  questions: Question[],
  group: GroupRequirement[],
) {
  let persistent = true;
  let document: Document = { version: 2, lessons: {}, completedGroups: [] };
  try {
    document = parseDocument(localStorage.getItem(checkpointStorageKey));
  } catch {
    persistent = false;
  }
  let state = normalizeLesson(document.lessons[id], revision, questions);
  const listeners = new Set<() => void>();
  const required = questions.filter((q) => q.id.startsWith("checkpoint-"));
  const solved = () => required.filter((q) => isSolved(q, state.answers[q.id])).length;
  const readPage = (page: GroupRequirement) =>
    page.lessonId === id
      ? state
      : normalizeLesson(document.lessons[page.lessonId], page.revision, [...page.questions, ...page.predictions]);
  const groupPassed = () =>
    group.every((page) => {
      const saved = readPage(page);
      return page.questions.every((q) => isSolved(q, saved.answers[q.id]));
    });
  const completed = () =>
    groupPassed() && (document.completedGroups.includes(groupId) || group.some((page) => readPage(page).completed));
  const notify = () => listeners.forEach((listener) => listener());
  function save() {
    document.lessons[id] = state;
    if (persistent) {
      try {
        localStorage.setItem(checkpointStorageKey, JSON.stringify(document));
      } catch {
        persistent = false;
      }
    }
    notify();
  }
  function refresh() {
    if (persistent) {
      try {
        document = parseDocument(localStorage.getItem(checkpointStorageKey));
        state = normalizeLesson(document.lessons[id], revision, questions);
      } catch {
        persistent = false;
      }
    }
  }
  async function write(action: () => void) {
    if (!persistent || !navigator.locks) {
      action();
      return;
    }
    let entered = false;
    try {
      await navigator.locks.request(checkpointStorageKey, () => {
        entered = true;
        action();
      });
    } catch (error) {
      if (entered) throw error;
      persistent = false;
      action();
    }
  }
  window.addEventListener("storage", (event) => {
    if (!persistent || (event.key !== checkpointStorageKey && event.key !== null)) return;
    refresh();
    notify();
  });
  return {
    get state() {
      return state;
    },
    get persistent() {
      return persistent;
    },
    get solvedCount() {
      return solved();
    },
    get total() {
      return required.length;
    },
    get canFinish() {
      return groupPassed();
    },
    get completed() {
      return completed();
    },
    update(change: (value: LessonState) => void) {
      return write(() => {
        refresh();
        change(state);
        if (solved() !== required.length) state.completed = false;
        if (!groupPassed()) document.completedGroups = document.completedGroups.filter((value) => value !== groupId);
        save();
      });
    },
    setCompleted(value: boolean) {
      return write(() => {
        refresh();
        if (!groupPassed()) return;
        document.completedGroups = document.completedGroups.filter((item) => item !== groupId);
        if (value) document.completedGroups.push(groupId);
        for (const page of group) {
          const saved = readPage(page);
          saved.completed = false;
          document.lessons[page.lessonId] = saved;
        }
        state.completed = false;
        save();
      });
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      listener();
      return () => listeners.delete(listener);
    },
  };
}
export type CheckpointStore = ReturnType<typeof createCheckpointStore>;
