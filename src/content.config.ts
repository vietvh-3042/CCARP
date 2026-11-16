import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const lessons = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/lessons" }),
  schema: z.object({
    lessonId: z.string(),
    locale: z.enum(["en", "vi"]),
    title: z.string(),
    description: z.string(),
    domain: z.number().int().min(1).max(7),
    order: z.number(),
    sourceImage: z.string(),
    sourceHash: z.string(),
    status: z.enum(["transcribed-draft", "source-verified"]),
    groupId: z.string().optional(),
    sourceUrl: z.string().optional(),
    sourceSlug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    part: z.number().int().default(1),
    partCount: z.number().int().default(1),
    lessonNumber: z.number().int().default(1),
    readMinutes: z.number().default(0),
    examWeight: z.number().default(0),
    sourceCount: z.number().int().default(0),
    publishedAt: z.string().default(""),
    docsAsOf: z.string().default(""),
    sections: z.array(z.object({ id: z.string(), title: z.string() })),
  }),
});
export const collections = { lessons };
