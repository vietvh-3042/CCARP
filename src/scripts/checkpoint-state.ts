import type { Question } from "../lib/lesson-checkpoints";
interface Attempt {
  selected?: number;
  rejected: number[];
  pairs: number[];
  wrong?: number;
  choices: number[];
  order: number[];
  checked: boolean;
}
export interface LessonState {
  revision: string;
  completed: boolean;
  answers: Record<string, Attempt>;
}
export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
function emptyAttempt(question: Question): Attempt {
  return {
    rejected: [],
    pairs: question.type === "match" ? question.pairs.map(() => -1) : [],
    choices: [],
    order: question.type === "order" ? Array.from({ length: question.itemCount }, (_, i) => i) : [],
    checked: false,
  };
}
export function isSolved(question: Question, attempt: Attempt): boolean {
  if (question.type === "choice") return attempt.selected === question.answerIndex;
  if (question.type === "multi")
    return (
      attempt.checked &&
      attempt.choices.length === question.answerIndices.length &&
      question.answerIndices.every((value) => attempt.choices.includes(value))
    );
  if (question.type === "order")
    return attempt.checked && question.correctOrder.every((value, index) => attempt.order[index] === value);
  return question.pairs.every((value, index) => attempt.pairs[index] === value);
}
const validIndex = (value: unknown, length: number): value is number =>
  typeof value === "number" && Number.isInteger(value) && value >= 0 && value < length;
export function normalizeLesson(raw: unknown, revision: string, questions: Question[]): LessonState {
  const source = isRecord(raw) && raw.revision === revision ? raw : {};
  const saved = isRecord(source.answers) ? source.answers : {};
  const answers: Record<string, Attempt> = {};
  for (const question of questions) {
    const attempt = emptyAttempt(question);
    const value = saved[question.id];
    if (isRecord(value)) {
      const length =
        question.type === "choice" || question.type === "multi"
          ? question.optionCount
          : question.type === "match"
            ? question.pairs.length
            : question.itemCount;
      if (question.type === "choice") {
        if (validIndex(value.selected, length)) attempt.selected = value.selected;
        if (Array.isArray(value.rejected))
          attempt.rejected = [
            ...new Set(
              value.rejected.filter(
                (item): item is number => validIndex(item, length) && item !== question.answerIndex,
              ),
            ),
          ];
      } else if (question.type === "match") {
        if (Array.isArray(value.pairs)) {
          const pairs = value.pairs;
          attempt.pairs = question.pairs.map((correct, index) => (pairs[index] === correct ? correct : -1));
        }
        if (validIndex(value.selected, length) && attempt.pairs[value.selected] === -1)
          attempt.selected = value.selected;
        if (attempt.selected !== undefined && validIndex(value.wrong, length) && !attempt.pairs.includes(value.wrong))
          attempt.wrong = value.wrong;
      } else if (question.type === "multi") {
        if (Array.isArray(value.choices))
          attempt.choices = [...new Set(value.choices.filter((item): item is number => validIndex(item, length)))];
        attempt.checked = value.checked === true && attempt.choices.length === question.answerIndices.length;
      } else {
        if (
          Array.isArray(value.order) &&
          value.order.length === length &&
          new Set(value.order).size === length &&
          value.order.every((item) => validIndex(item, length))
        )
          attempt.order = value.order;
        attempt.checked = value.checked === true;
      }
    }
    answers[question.id] = attempt;
  }
  const passed = questions.filter((q) => q.id.startsWith("checkpoint-")).every((q) => isSolved(q, answers[q.id]));
  return { revision, answers, completed: source.completed === true && passed };
}
