import { readFileSync, mkdirSync, writeFileSync, renameSync } from "node:fs";
import { load } from "cheerio";
const [id, payload] = process.argv.slice(2);
if (id === "--check") {
  console.log("Writes only validated bilingual trap explanations.");
  process.exit(0);
}
if (!/^[1-7][.][1-8](?:[.]2)?$/.test(id ?? "")) throw Error("Invalid page ID");
const root = "/home/Workspaces/CCARPP";
const $ = load(readFileSync(`${root}/.cache/course-source/${id.replaceAll(".", "-")}.html`, "utf8"));
let nudge = 0;
const expected = $("main article details")
  .not("#sources")
  .map((_, node) => $(node).parent().attr("id") ?? `nudge-${++nudge}`)
  .get();
const data = JSON.parse(payload ?? "null");
if (!data || Object.keys(data).length !== expected.length) throw Error(`Expected ${expected.length} traps`);
for (const key of expected) {
  const value = data[key];
  if (!value || !["en", "vi"].every((locale) => typeof value[locale] === "string" && value[locale].trim()))
    throw Error(`Missing ${key}`);
  if (value.en.trim().split(/\s+/).length > 36) throw Error(`Explanation too long ${key}`);
  if (Object.keys(value).sort().join() !== "en,vi") throw Error("Unexpected fields");
}
const directory = `${root}/src/data/trap-explanations`;
mkdirSync(directory, { recursive: true });
const path = `${directory}/${id}.json`;
writeFileSync(path + ".tmp", JSON.stringify(data, null, 2) + "\n");
renameSync(path + ".tmp", path);
console.log(`Saved ${id}: ${expected.length} original bilingual explanations`);
