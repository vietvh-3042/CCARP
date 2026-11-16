import { lessonUrl, pageId } from "../src/lib/lesson-routes.mjs";
import { createHash } from "node:crypto";
export function prepareArticle(document, outline) {
  const { $ } = document;
  const article = $("main article").first();
  if (article.length !== 1) throw Error(`${document.id}: article missing`);
  const badges = article.children("div").first();
  const badgeText = badges.text();
  badges.remove();
  article.find("script,style,iframe,object,noscript,[hidden]").remove();
  const sources = article
    .find("#sources > ol > li")
    .map((_, li) => ({
      number: Number($(li).attr("id")?.split("-").at(-1)),
      url: $(li).find('a[href^="https://"]').first().attr("href"),
    }))
    .get();
  article.find("#sources > p").remove();
  article.find("#sources > ol > li").each((_, li) => {
    const item = $(li);
    const link = item.find('a[href^="https://"]').first().clone();
    item.empty().append(link);
  });
  article
    .find("details")
    .not("#sources")
    .each((_, element) => {
      const detail = $(element);
      const summary = detail.children("summary").first().clone();
      const section = detail.closest("section.mt-12");
      const context = section.children("p").first().clone();
      detail.empty().append(summary);
      if (context.length) detail.append(context.attr("data-authored-explanation", ""));
    });
  const sections = [];
  article.children("section.mt-12").each((index, section) => {
    const heading = $(section).children("h2").first();
    const id = `section-${index + 1}`;
    const originalId = heading.attr("id") ?? $(section).attr("id");
    sections.push({ id, title: heading.text().replace(/^[0-9]+[.]\s*/, "") });
    if (originalId) {
      article.find("a").each((_, a) => {
        if ($(a).attr("href") === `#${originalId}`) $(a).attr("href", `#${id}`);
      });
    }
    heading.attr("id", id).attr("data-lesson-section", "");
  });
  article.find("button").attr("disabled", "").attr("data-requires-js", "");
  const slugMap = new Map(
    outline.map((item) => [new URL(item.sourceUrl).pathname, lessonUrl("__LOCALE__", pageId(item))]),
  );
  article.find("a[href]").each((_, element) => {
    const a = $(element);
    const href = a.attr("href");
    if (href.startsWith("#")) return;
    const url = new URL(href, "https://www.certsafari.com");
    if (slugMap.has(url.pathname)) a.attr("href", `${slugMap.get(url.pathname)}${url.search}${url.hash}`);
    else if (url.pathname === "/anthropic/claude-architect-professional/learn") a.attr("href", "/__LOCALE__/");
    else if (href.startsWith("/")) a.attr("href", url.href);
    if (a.attr("href").startsWith("https://")) a.attr("rel", "noreferrer").attr("target", "_blank");
  });
  return { article, sections, sources, badgeText };
}
export function translationUnits(article, description) {
  const units = [{ id: "description", text: description }];
  let next = 0;
  function visit(node, blocked = false, authored = false) {
    authored ||= node.attribs?.["data-authored-explanation"] !== undefined;
    const skip = blocked || ["pre", "code", "svg", "script", "style", "kbd", "samp"].includes(node.tagName);
    if (node.type === "text" && !skip && /[a-zA-Z]{2}/.test(node.data) && !/^\s*https?:\/\//.test(node.data)) {
      const id = `u${String(next++).padStart(4, "0")}`;
      if (!authored) {
        units.push({ id, text: node.data });
        node.__translationId = id;
      }
    }
    for (const child of node.children ?? []) visit(child, skip, authored);
  }
  visit(article[0]);
  return units;
}
export function renderArticle($, article, translations, locale, explanations) {
  function visit(node) {
    if (node.__translationId && translations) {
      const value = translations[node.__translationId];
      if (typeof value !== "string") throw Error(`Missing translation ${node.__translationId}`);
      node.data = value;
    }
    for (const child of node.children ?? []) visit(child);
  }
  visit(article[0]);
  let nudge = 0;
  article
    .find("details")
    .not("#sources")
    .each((_, node) => {
      const detail = $(node);
      const key = detail.parent().attr("id") ?? `nudge-${++nudge}`;
      const text = explanations[key]?.[locale];
      if (!text) throw Error(`Missing authored explanation ${key}/${locale}`);
      const summary = detail.children("summary").first().remove();
      detail
        .empty()
        .append(summary)
        .append(
          $("<p>").attr("data-explanation", key).addClass("mt-2 text-sm leading-relaxed text-foreground").text(text),
        );
    });
  if (locale === "vi")
    article.find("[aria-label]").each((_, node) => {
      const value = $(node).attr("aria-label");
      const labels = {
        "In this lesson": "Trong bài này",
        "Exam trap": "Bẫy bài thi",
        "Exam traps": "Bẫy bài thi",
        Terms: "Thuật ngữ",
        Definitions: "Định nghĩa",
      };
      $(node).attr(
        "aria-label",
        labels[value] ??
          value
            .replace(/Move step ([0-9]+) up/, "Đưa bước $1 lên")
            .replace(/Move step ([0-9]+) down/, "Đưa bước $1 xuống"),
      );
    });
  return `<div data-course-content class="[&_button]:cursor-pointer [&_button:disabled]:cursor-default [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-primary">${article.html().replaceAll("/__LOCALE__/", `/${locale}/`)}</div>`.replaceAll(
    "\n",
    "&#10;",
  );
}
export const sourceRevision = (questions) =>
  createHash("sha256")
    .update(
      JSON.stringify(
        questions.map(
          ({ id, type, contentHash, optionCount, itemCount, answerIndex, answerIndices, pairs, correctOrder }) => ({
            id,
            type,
            contentHash,
            optionCount,
            itemCount,
            answerIndex,
            answerIndices,
            pairs,
            correctOrder,
          }),
        ),
      ),
    )
    .digest("hex")
    .slice(0, 16);
