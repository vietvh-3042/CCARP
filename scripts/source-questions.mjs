import { createHash } from "node:crypto";
const norm = (text) =>
  text
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[*][*](.*?)[*][*]/g, "$1")
    .replace(/^[A-Z][.]\s*/, "")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
export function extractQuestions(document, article) {
  const { $, blocks, exams, predictions } = document;
  const questions = [];
  const practices = [];
  article.find('[id^="checkpoint-"]').each((_, element) => {
    const panel = $(element);
    const nativeId = panel.attr("id");
    const number = questions.length + 1;
    const block =
      blocks.find((item) => nativeId.endsWith(item.block.id))?.block ?? exams.get(Number(nativeId.split("-").at(-1)));
    if (!block) throw Error(`${document.id}: no source data for ${nativeId}`);
    panel.find("[hidden],noscript").remove();
    const data = {
      id: `checkpoint-${number}`,
      sourceId: String(block.id),
      sourceType: block.type ?? "exam",
      type: block.type ?? "choice",
      sourceUrl:
        block.citation?.sourceUrl ?? block.sourceUrl ?? `${document.entry.sourceUrl.split("#")[0]}#${nativeId}`,
    };
    const header = panel.children().first();
    const label = header.find("p").first();
    label.replaceWith(
      `<h3 id="${data.id}" class="flex items-center gap-2 text-sm font-semibold text-foreground">${label.html()}</h3>`,
    );
    panel.addClass("question").attr("data-checkpoint-panel", data.id);
    header.addClass("question-heading");
    const body = panel.children().eq(1).attr("data-question-body", "");
    if (data.type === "match") {
      const lists = body
        .find("ul")
        .filter((_, list) => $(list).children("li").find("button").length > 0)
        .slice(0, 2);
      if (lists.length !== 2) throw Error(`Missing matching columns: ${document.id}/${data.id}`);
      const terms = lists
        .eq(0)
        .children("li")
        .map((_, li) => norm($(li).text()))
        .get();
      const defs = lists
        .eq(1)
        .children("li")
        .map((_, li) => norm($(li).text()))
        .get();
      lists.eq(0).attr("data-term-list", "");
      lists.eq(1).attr("data-definition-list", "");
      lists.first().parent().addClass("matching-columns");
      data.pairs = terms.map((term) =>
        defs.findIndex((def) => norm(block.pairs.find((pair) => norm(pair.term) === term)?.definition ?? "") === def),
      );
      if (data.pairs.some((index) => index < 0)) throw Error(`Pair mismatch: ${document.id}/${data.id}`);
    } else if (data.type === "order") {
      const list = body.find("ol").first().attr("data-order-list", "");
      const items = list
        .children("li")
        .map((_, li) => norm($(li).children("span").eq(1).text()))
        .get();
      data.correctOrder = block.steps.map((step) => items.findIndex((text) => text === norm(step)));
      data.itemCount = items.length;
      if (data.correctOrder.some((index) => index < 0)) throw Error(`Order mismatch: ${document.id}/${data.id}`);
      body
        .find("button")
        .filter((_, button) => $(button).text().includes("Check order"))
        .attr("data-check-order", "");
    } else {
      const list = body.find("ol").first().attr("data-choice-options", "");
      const options = list
        .children("li")
        .map((_, li) => norm($(li).text()))
        .get();
      const correct = block.correct_answers
        ? block.correct_answers.map((key) => block.options[key.charCodeAt(0) - 65])
        : [block.options[block.answerIndex]];
      const indices = correct.map((answer) => options.findIndex((option) => option === norm(answer)));
      if (indices.some((index) => index < 0) || !options.length)
        throw Error(`Choice mismatch: ${document.id}/${data.id}`);
      data.type = indices.length > 1 ? "multi" : "choice";
      data.optionCount = options.length;
      if (indices.length > 1) {
        data.answerIndices = indices;
        body
          .find("button")
          .filter((_, button) => $(button).text().includes("Check answer"))
          .attr("data-check-answer", "");
      } else data.answerIndex = indices[0];
    }
    data.contentHash = createHash("sha256").update(panel.text()).digest("hex");
    questions.push(data);
  });
  for (const [index, prediction] of predictions.entries()) {
    const prompt = article
      .find("p")
      .filter((_, node) => norm($(node).text()) === norm(prediction.prompt))
      .first();
    if (!prompt.length) throw Error(`Missing prediction ${document.id}/${index}`);
    const panel = prompt
      .parents()
      .filter((_, node) => ($(node).attr("class") ?? "").includes("border-l-"))
      .first();
    if (!panel.length) throw Error(`Missing prediction panel ${document.id}/${index}`);
    panel.find("[hidden],noscript").remove();
    panel.addClass("practice-question");
    if (index === 0) panel.addClass("predict-first");
    const id = `predict-${index + 1}`;
    panel.attr("data-practice-id", id);
    const list = panel
      .find("ol,ul")
      .filter((_, list) => $(list).children("li").find("button").length > 0)
      .first()
      .attr("data-choice-options", "");
    const options = list
      .children("li")
      .map((_, li) => norm($(li).text()))
      .get();
    const answerIndex = options.findIndex((option) => option === norm(prediction.options[prediction.answerIndex]));
    if (answerIndex < 0) throw Error(`Prediction answer mismatch ${document.id}/${index}`);
    practices.push({
      id,
      sourceId: prediction.id,
      type: "choice",
      sourceType: "prediction",
      contentHash: createHash("sha256").update(panel.text()).digest("hex"),
      optionCount: options.length,
      answerIndex,
      sourceUrl: prediction.citation.sourceUrl,
    });
  }
  return { questions, practices };
}
