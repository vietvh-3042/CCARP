import { pageId } from "../src/lib/lesson-routes.mjs";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { load } from "cheerio";
export async function sourceDocument(entry) {
  const id = pageId(entry);
  const path = `.cache/course-source/${id.replaceAll(".", "-")}.html`;
  let html;
  try {
    html = await readFile(path, "utf8");
  } catch {
    const url = new URL(entry.sourceUrl);
    url.hash = "";
    const response = await fetch(url);
    if (!response.ok) throw Error(`${id}: source HTTP ${response.status}`);
    html = await response.text();
    await mkdir(".cache/course-source", { recursive: true });
    await writeFile(path, html);
  }
  const $ = load(html);
  let flight = "";
  for (const match of html.matchAll(/self[.]__next_f[.]push\((\[.*?\])\)/gs)) {
    try {
      const value = JSON.parse(match[1]);
      if (typeof value[1] === "string") flight += value[1];
    } catch {}
  }
  const blocks = [];
  const exams = new Map();
  const predictions = [];
  function walk(value) {
    if (!value || typeof value !== "object") return;
    if (value.block && value.position) blocks.push({ block: value.block, position: value.position });
    if (value.correct_answers) exams.set(value.id, value);
    if (typeof value.id === "string" && value.id.startsWith("predict:")) predictions.push(value);
    for (const child of Object.values(value)) walk(child);
  }
  for (const line of flight.split("\n")) {
    try {
      walk(JSON.parse(line.slice(line.indexOf(":") + 1)));
    } catch {}
  }
  return {
    id,
    entry,
    $,
    html,
    blocks,
    exams,
    predictions,
    hash: createHash("sha256").update(html).digest("hex"),
  };
}
