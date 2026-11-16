import outline from "../data/course-outline.json" with { type: "json" };

/** @param {{ lessonId: string, part: number }} entry */
export const pageId = (entry) => (entry.part === 1 ? entry.lessonId : `${entry.lessonId}.${entry.part}`);

const slugs = new Map(outline.map((entry) => [pageId(entry), new URL(entry.sourceUrl).pathname.split("/").at(-1)]));

/** @param {string} locale @param {string} id */
export function lessonUrl(locale, id) {
  const slug = slugs.get(id);
  if (!slug) throw new Error(`Unknown lesson: ${id}`);
  return `/${locale}/lessons/${slug}/`;
}
