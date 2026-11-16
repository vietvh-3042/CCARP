import { z } from "astro/zod";
import source from "../data/checkpoints/course.json";
const base = z.object({
  id: z.string().regex(/^(checkpoint|predict)-[0-9]+$/),
  sourceId: z.string().min(1),
  sourceType: z.string().optional(),
  sourceUrl: z.url().startsWith("https://"),
  contentHash: z.string().optional(),
});
const questionSchema = z
  .discriminatedUnion("type", [
    base.extend({
      type: z.literal("choice"),
      optionCount: z.number().int().min(2),
      answerIndex: z.number().int().min(0),
    }),
    base.extend({
      type: z.literal("multi"),
      optionCount: z.number().int().min(2),
      answerIndices: z.array(z.number().int().min(0)).min(2),
    }),
    base.extend({ type: z.literal("match"), pairs: z.array(z.number().int().min(0)).min(2) }),
    base.extend({
      type: z.literal("order"),
      itemCount: z.number().int().min(2),
      correctOrder: z.array(z.number().int().min(0)).min(2),
    }),
  ])
  .superRefine((question, context) => {
    const indices =
      question.type === "choice"
        ? [question.answerIndex]
        : question.type === "multi"
          ? question.answerIndices
          : question.type === "match"
            ? question.pairs
            : question.correctOrder;
    const length =
      question.type === "choice" || question.type === "multi"
        ? question.optionCount
        : question.type === "match"
          ? question.pairs.length
          : question.itemCount;
    if (
      new Set(indices).size !== indices.length ||
      indices.some((index) => index >= length) ||
      (question.type === "order" && indices.length !== length)
    )
      context.addIssue({ code: "custom", message: "Answers must address distinct existing options" });
  });
const lessonSchema = z
  .object({
    lessonId: z.string(),
    groupId: z.string(),
    part: z.number().int(),
    revision: z.string(),
    verifiedAt: z.iso.datetime(),
    sourceUrl: z.url().startsWith("https://"),
    questions: z.array(questionSchema).min(1),
    predictions: z.array(questionSchema),
    sources: z.array(z.object({ number: z.number().int(), url: z.url() })),
  })
  .superRefine((lesson, context) => {
    if (
      lesson.questions.some((question, index) => question.id !== `checkpoint-${index + 1}`) ||
      lesson.predictions.some((question, index) => question.id !== `predict-${index + 1}`)
    )
      context.addIssue({ code: "custom", message: "Checkpoint identifiers must be unique and sequential" });
  });
export type Question = z.infer<typeof questionSchema>;
export type ChoiceQuestion = Extract<Question, { type: "choice" }>;
export type MatchQuestion = Extract<Question, { type: "match" }>;
export type MultiQuestion = Extract<Question, { type: "multi" }>;
export type OrderQuestion = Extract<Question, { type: "order" }>;
export type LessonCheckpoints = z.infer<typeof lessonSchema>;
export interface GroupRequirement {
  lessonId: string;
  revision: string;
  questions: Question[];
  predictions: Question[];
}
const lessons = z.record(z.string(), lessonSchema).parse(source);
export function getLessonCheckpoints(id: string) {
  const lesson = lessons[id];
  if (!lesson) throw Error(`No verified checkpoints for ${id}`);
  return lesson;
}
export function getGroupRequirements(groupId: string): GroupRequirement[] {
  return Object.values(lessons)
    .filter((lesson) => lesson.groupId === groupId)
    .map(({ lessonId, revision, questions, predictions }) => ({ lessonId, revision, questions, predictions }));
}
