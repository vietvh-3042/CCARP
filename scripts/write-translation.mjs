import { readFileSync, writeFileSync, renameSync } from "node:fs";
const [pageId, payload] = process.argv.slice(2);
if (pageId === "--check") {
  console.log("Writer restricted to validated course translation JSON only.");
  process.exit(0);
}
if (!/^[1-7][.][1-8](?:[.]2)?$/.test(pageId ?? "")) throw Error("Invalid course page ID");
const source = JSON.parse(readFileSync(`/home/Workspaces/CCARPP/src/data/translation-source/${pageId}.json`, "utf8"));
const values = JSON.parse(payload ?? "null");
if (!values || typeof values !== "object" || Array.isArray(values)) throw Error("Expected translation object");
const expected = source.units.map((unit) => unit.id);
if (Object.keys(values).length !== expected.length) throw Error(`Expected ${expected.length} translation entries`);
for (const unit of source.units) {
  const value = values[unit.id];
  if (typeof value !== "string" || !value.trim()) throw Error(`Missing translation ${unit.id}`);
  const numbers = (text) => (text.match(/[0-9]+(?:[.][0-9]+)*/g) ?? []).sort().join("|");
  if (numbers(value) !== numbers(unit.text))
    throw Error(`Numeric mismatch ${unit.id}: ${numbers(unit.text)} != ${numbers(value)}`);
  if (/^\s/.test(unit.text) !== /^\s/.test(value) || /\s$/.test(unit.text) !== /\s$/.test(value))
    throw Error(`Preserve boundary whitespace for ${unit.id}`);
  if (/[<>]/.test(value) && !/[<>]/.test(unit.text)) throw Error(`Unexpected markup in ${unit.id}`);
}
const path = `/home/Workspaces/CCARPP/src/data/translations/${pageId}.json`;
writeFileSync(path + ".tmp", JSON.stringify(values, null, 2) + "\n");
renameSync(path + ".tmp", path);
console.log(`Saved ${pageId}: ${expected.length} verified translation units.`);
