import { lessonUrl } from "../src/lib/lesson-routes.mjs";
import { auditBuiltLinks } from "./audit-built-links.mjs";
import { readFileSync, existsSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { load } from "cheerio";
import { parse } from "yaml";
import { sourceDocument } from "./source-client.mjs";
const read = (path) => readFileSync(path, "utf8");
const outline = JSON.parse(read("src/data/course-outline.json"));
const pages = JSON.parse(read("src/data/course-pages.json"));
const bundles = JSON.parse(read("src/data/checkpoints/course.json"));
const errors = [];
const assert = (condition, message) => {
  if (!condition) errors.push(message);
};
const norm = (text) =>
  text
    .replace(/`|\*\*/g, "")
    .replace(/^[A-Z][.]\s*/, "")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
const documents = new Map();
let codeBlocks = 0,
  links = 0,
  translationUnits = 0,
  questionCount = 0;
for (const entry of outline) {
  const source = await sourceDocument(entry);
  const page = pages.find((page) => page.lessonId === source.id);
  const bundle = bundles[source.id];
  assert(!!page && !!bundle, `${source.id}: missing page or checkpoint bundle`);
  if (!page || !bundle) continue;
  const originalCode = source
    .$("main article pre")
    .filter((_, node) => !source.$(node).parents("[hidden],noscript,details").length)
    .map((_, node) => source.$(node).text())
    .get();
  const sourceQuestions = source.$('main article [id^="checkpoint-"]');
  assert(sourceQuestions.length === bundle.questions.length, `${source.id}: checkpoint count`);
  questionCount += bundle.questions.length;
  const unitSource = JSON.parse(read(`src/data/translation-source/${source.id}.json`));
  const mapPath = `src/data/translations/${source.id}.json`;
  assert(existsSync(mapPath), `${source.id}: Vietnamese translation missing`);
  if (existsSync(mapPath)) {
    const translated = JSON.parse(read(mapPath));
    assert(Object.keys(translated).length === unitSource.units.length, `${source.id}: translation unit count`);
    for (const unit of unitSource.units) {
      const value = translated[unit.id];
      assert(typeof value === "string" && value.trim(), `${source.id}/${unit.id}: translation empty`);
      if (typeof value !== "string") continue;
      const numbers = (text) => (text.match(/[0-9]+(?:[.][0-9]+)*/g) ?? []).sort().join("|");
      assert(numbers(value) === numbers(unit.text), `${source.id}/${unit.id}: numbers changed`);
      assert(
        /^\s/.test(value) === /^\s/.test(unit.text) && /\s$/.test(value) === /\s$/.test(unit.text),
        `${source.id}/${unit.id}: boundary whitespace changed`,
      );
      assert(
        value !== unit.text || unit.text.trim().split(/\s+/).length < 18,
        `${source.id}/${unit.id}: long English passage unchanged`,
      );
      translationUnits++;
    }
  }
  for (const locale of ["en", "vi"]) {
    const path = `src/content/lessons/${locale}/${page.filename}.md`;
    assert(existsSync(path), `${source.id}/${locale}: markdown missing`);
    if (!existsSync(path)) continue;
    const markdown = read(path);
    const metadata = parse(markdown.match(/^---\n([\s\S]*?)\n---/)[1]);
    const $ = load(markdown.replace(/^---\n[\s\S]*?\n---/, ""));
    assert(
      metadata.title === (locale === "en" ? entry.title : entry.titleVi),
      `${source.id}/${locale}: title mismatch`,
    );
    assert(
      createHash("sha256").update(readFileSync(metadata.sourceImage)).digest("hex") === metadata.sourceHash,
      `${source.id}: screenshot changed`,
    );
    const explanations = JSON.parse(read(`src/data/trap-explanations/${source.id}.json`));
    const details = $("details").not("#sources");
    assert(details.length === Object.keys(explanations).length, `${source.id}/${locale}: explanation count`);
    details.each((_, node) => {
      const explanation = $(node).find("[data-explanation]");
      const key = explanation.attr("data-explanation");
      assert(explanation.text() === explanations[key]?.[locale], `${source.id}/${locale}/${key}: wrong explanation`);
    });
    const actualCode = $("pre")
      .map((_, node) => $(node).text())
      .get();
    assert(
      JSON.stringify(actualCode) === JSON.stringify(originalCode),
      `${source.id}/${locale}: code differs from source`,
    );
    codeBlocks += actualCode.length;
    assert(
      $("[data-checkpoint-panel]").length === bundle.questions.length,
      `${source.id}/${locale}: rendered checkpoint count`,
    );
    const route = lessonUrl(locale, source.id);
    assert(existsSync(`dist${route}index.html`), `${route}: build missing`);
    if (existsSync(`dist${route}index.html`)) documents.set(route, load(read(`dist${route}index.html`)));
    if (locale !== "en") continue;
    bundle.questions.forEach((question, index) => {
      const original = source.$(sourceQuestions[index]);
      const block =
        source.blocks.find((item) => original.attr("id").endsWith(item.block.id))?.block ??
        source.exams.get(Number(question.sourceId));
      assert(!!block, `${source.id}/${question.id}: source answer missing`);
      const panel = $(`[data-checkpoint-panel="${question.id}"]`);
      if (question.type === "choice" || question.type === "multi") {
        const correct = block.correct_answers
          ? block.correct_answers.map((key) => block.options[key.charCodeAt(0) - 65])
          : [block.options[block.answerIndex]];
        const indices = question.type === "choice" ? [question.answerIndex] : question.answerIndices;
        const options = panel
          .find("[data-choice-options] > li")
          .map((_, node) => norm($(node).text()))
          .get();
        assert(
          JSON.stringify(indices.map((index) => options[index]).sort()) === JSON.stringify(correct.map(norm).sort()),
          `${source.id}/${question.id}: choice answer mismatch`,
        );
      } else if (question.type === "match") {
        const terms = panel
          .find("[data-term-list]>li")
          .map((_, node) => norm($(node).text()))
          .get();
        const definitions = panel
          .find("[data-definition-list]>li")
          .map((_, node) => norm($(node).text()))
          .get();
        assert(
          question.pairs.every((target, index) =>
            block.pairs.some(
              (pair) => norm(pair.term) === terms[index] && norm(pair.definition) === definitions[target],
            ),
          ),
          `${source.id}/${question.id}: matching answer mismatch`,
        );
      } else {
        const items = panel
          .find("[data-order-list]>li")
          .map((_, node) => norm($(node).children("span").eq(1).text()))
          .get();
        assert(
          JSON.stringify(question.correctOrder.map((index) => items[index])) === JSON.stringify(block.steps.map(norm)),
          `${source.id}/${question.id}: order answer mismatch`,
        );
      }
    });
  }
}
for (const locale of ["en", "vi"])
  if (existsSync(`dist/${locale}/index.html`)) documents.set(`/${locale}/`, load(read(`dist/${locale}/index.html`)));
links = auditBuiltLinks(documents, errors);
function files(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = `${directory}/${name}`;
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}
assert(!files("src").some((path) => path.endsWith(".css")), "Standalone CSS remains");
assert(pages.length === 53 && questionCount === 395, "Source inventory changed");
const report = { pages: pages.length, locales: 2, questionCount, codeBlocks, translationUnits, links, errors };
writeFileSync("plans/20261116-full-course-tailwind/source-audit.json", JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;
