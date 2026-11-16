import { readFileSync, writeFileSync } from "node:fs";
import { pageId } from "../src/lib/lesson-routes.mjs";
import { sourceDocument } from "./source-client.mjs";
const outline = JSON.parse(readFileSync("src/data/course-outline.json", "utf8"));
if (new Set(outline.map((entry) => new URL(entry.sourceUrl).pathname)).size !== 53)
  throw Error("Expected53 distinct sourcepages");
const pages = [];
let cursor = 0;
async function worker() {
  while (cursor < outline.length) {
    const entry = outline[cursor++];
    const document = await sourceDocument(entry);
    const { $ } = document;
    const types = document.blocks.map(({ block, position }) => ({
      number: position.number,
      type: block.type,
      kind: block.kind,
      keys: Object.keys(block),
      options: block.options?.length,
      pairCount: block.pairs?.length,
    }));
    const page = {
      id: pageId(entry),
      title: $("main h1").first().text().trim(),
      sourceUrl: entry.sourceUrl,
      hash: document.hash,
      articleCount: $("main article").length,
      checkpointPanels: $('main [id^="checkpoint-"]').length,
      types,
      exams: [...document.exams.values()].map((q) => ({
        id: q.id,
        correctCount: q.correct_answers.length,
        optionCount: q.options.length,
      })),
      predictions: document.predictions.length,
      articleChildren: $("main article")
        .first()
        .children()
        .slice(0, 5)
        .map((_, node) => ({ tag: node.tagName, classes: $(node).attr("class"), text: $(node).text().slice(0, 65) }))
        .get(),
    };
    pages.push(page);
    console.log(
      `${page.id}: ${page.checkpointPanels} checkpoints, ${types.map((t) => t.type).join(",")}, ${page.exams.length} exams`,
    );
  }
}
await Promise.all(Array.from({ length: 4 }, worker));
pages.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
writeFileSync("plans/20261116-full-course-tailwind/source-inventory.json", JSON.stringify(pages, null, 2) + "\n");
const types = {};
for (const page of pages) for (const item of page.types) types[item.type] = (types[item.type] ?? 0) + 1;
console.log(
  JSON.stringify(
    {
      pages: pages.length,
      types,
      examQuestions: pages.reduce((sum, p) => sum + p.exams.length, 0),
      multiSelect: pages.flatMap((p) => p.exams).filter((q) => q.correctCount > 1).length,
      totalCheckpointPanels: pages.reduce((s, p) => s + p.checkpointPanels, 0),
      articleChildren: pages[0].articleChildren,
    },
    null,
    2,
  ),
);
