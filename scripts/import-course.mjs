import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { pageId } from "../src/lib/lesson-routes.mjs";
import { sourceDocument } from "./source-client.mjs";
import { extractQuestions } from "./source-questions.mjs";
import { prepareArticle, translationUnits, renderArticle, sourceRevision } from "./source-content.mjs";
const outline = JSON.parse(readFileSync("src/data/course-outline.json", "utf8"));
const images = JSON.parse(readFileSync("src/data/screenshot-inventory.json", "utf8"));
const groups = [...new Set(outline.map((entry) => entry.lessonId))];
const pages = [];
const bundles = {};
const pending = [];
for (const entry of outline) {
  const doc = await sourceDocument(entry);
  const { $ } = doc;
  const { article, sections, sources, badgeText } = prepareArticle(doc, outline);
  const { questions, practices } = extractQuestions(doc, article);
  const id = pageId(entry),
    slug = new URL(entry.sourceUrl).pathname.split("/").at(-1);
  const title = $("main h1").first().text().trim();
  if (title !== entry.title) throw Error(`Source title changed: ${id}`);
  const description = $("main h1").first().next("div").find("p").first().text().trim();
  const image = images.find((image) => image.lessonId === entry.lessonId && image.part === entry.part);
  const metadata = {
    lessonId: id,
    groupId: entry.lessonId,
    locale: "en",
    title,
    description,
    domain: Number(entry.lessonId.split(".")[0]),
    order: groups.indexOf(entry.lessonId) * 10 + entry.part,
    part: entry.part,
    partCount: outline.filter((item) => item.lessonId === entry.lessonId).length,
    lessonNumber: groups.indexOf(entry.lessonId) + 1,
    sourceSlug: slug,
    sourceUrl: entry.sourceUrl.split("#")[0],
    sourceImage: image.image,
    sourceHash: image.sha256,
    status: "source-verified",
    readMinutes: Number(badgeText.match(/([0-9]+) min read/)?.[1] ?? 0),
    examWeight: Number(badgeText.match(/([0-9.]+)% of exam/)?.[1] ?? 0),
    sourceCount: sources.length,
    publishedAt: badgeText.match(/Published (.+?)(?:✓|Docs as)/)?.[1]?.trim() ?? "",
    docsAsOf: badgeText.match(/Docs as of (.+)$/)?.[1]?.trim() ?? "",
    sections: sections.map(({ id, title }) => ({ id, title })),
  };
  const units = translationUnits(article, description);
  const filename = id === "1.1" ? "business-problems-to-claude-solutions" : slug;
  const unitPath = `src/data/translation-source/${id}.json`;
  mkdirSync("src/data/translation-source", { recursive: true });
  mkdirSync("src/data/translations", { recursive: true });
  writeFileSync(unitPath, JSON.stringify({ pageId: id, title, titleVi: entry.titleVi, units }, null, 2) + "\n");
  const explanations = JSON.parse(readFileSync(`src/data/trap-explanations/${id}.json`, "utf8"));
  const body = renderArticle($, article, null, "en", explanations);
  const serialize = (meta, body) => `---\n${JSON.stringify(meta, null, 2)}\n---\n\n<!-- prettier-ignore -->\n${body}\n`;
  writeFileSync(`src/content/lessons/en/${filename}.md`, serialize(metadata, body));
  const translationPath = `src/data/translations/${id}.json`;
  let translated = false;
  if (existsSync(translationPath)) {
    const savedTranslations = JSON.parse(readFileSync(translationPath, "utf8"));
    const translations = Object.fromEntries(units.map((unit) => [unit.id, savedTranslations[unit.id]]));
    writeFileSync(translationPath, JSON.stringify(translations, null, 2) + "\n");
    if (!units.every((unit) => typeof translations[unit.id] === "string"))
      throw Error(`Incomplete Vietnamese translation ${id}`);
    const viBody = renderArticle($, article, translations, "vi", explanations);
    const viMetadata = {
      ...metadata,
      locale: "vi",
      title: entry.titleVi,
      description: translations.description,
      sections: sections.map((section) => ({
        id: section.id,
        title: article
          .find(`#${section.id}`)
          .text()
          .replace(/^[0-9]+[.]\s*/, ""),
      })),
    };
    writeFileSync(`src/content/lessons/vi/${filename}.md`, serialize(viMetadata, viBody));
    translated = true;
  } else pending.push(id);
  bundles[id] = {
    lessonId: id,
    groupId: entry.lessonId,
    part: entry.part,
    revision: sourceRevision([...questions, ...practices]),
    sourceUrl: metadata.sourceUrl,
    verifiedAt: new Date().toISOString(),
    questions,
    predictions: practices,
    sources,
  };
  pages.push({
    ...metadata,
    titleVi: entry.titleVi,
    filename,
    translated,
    wordCount: units.reduce((sum, unit) => sum + unit.text.trim().split(/\s+/).length, 0),
    translationUnits: units.length,
    checkpointCount: questions.length,
  });
  console.log(`${id}: ${questions.length} checkpoints, ${units.length} translation units, vi=${translated}`);
}
writeFileSync("src/data/course-pages.json", JSON.stringify(pages, null, 2) + "\n");
writeFileSync("src/data/checkpoints/course.json", JSON.stringify(bundles, null, 2) + "\n");
writeFileSync(
  "plans/20261116-full-course-tailwind/import-status.json",
  JSON.stringify(
    {
      pages: pages.length,
      translated: pages.length - pending.length,
      pending,
      totalCheckpoints: pages.reduce((s, p) => s + p.checkpointCount, 0),
      englishWords: pages.reduce((s, p) => s + p.wordCount, 0),
    },
    null,
    2,
  ) + "\n",
);
console.log(`Imported ${pages.length} pages. Pending Vietnamese: ${pending.length}.`);
