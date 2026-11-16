import { existsSync } from "node:fs";
export function auditBuiltLinks(documents, errors) {
  let links = 0;
  const assert = (condition, message) => {
    if (!condition) errors.push(message);
  };
  for (const [route, $] of documents) {
    const ids = $("[id]")
      .map((_, node) => $(node).attr("id"))
      .get();
    assert(new Set(ids).size === ids.length, `${route}: duplicate IDs`);
    $("a[href]").each((_, node) => {
      const href = $(node).attr("href");
      if (!href.startsWith("#") && !href.startsWith("/")) return;
      const url = new URL(href, `https://local.test${route}`);
      assert(!/^\/(en|vi)\/lessons\/[0-9.]+\/$/.test(url.pathname), `${route}: noncanonical lesson link ${href}`);
      const target = documents.get(url.pathname);
      assert(!!target || existsSync(`dist${url.pathname}index.html`), `${route}: missing link ${href}`);
      if (url.hash && target) {
        const id = decodeURIComponent(url.hash.slice(1));
        assert(
          target("[id]")
            .toArray()
            .some((node) => target(node).attr("id") === id),
          `${route}: missing fragment ${href}`,
        );
      }
      links++;
    });
  }
  return links;
}
