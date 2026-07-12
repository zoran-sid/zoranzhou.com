import { strict as assert } from "node:assert";
import { onRequest } from "../functions/index";

function redirect(headers: HeadersInit, query = "") {
  return onRequest({ request: new Request(`https://zoranzhou.com/${query}`, { headers }) });
}

const cases = [
  ["Chinese browser", { "Accept-Language": "zh-CN,zh;q=0.9" }, "/zh-CN/"],
  ["English browser", { "Accept-Language": "en-US,en;q=0.9" }, "/en/"],
  ["Unsupported browser", { "Accept-Language": "fr-FR,fr;q=0.9" }, "/en/"],
  ["English cookie override", { Cookie: "pref-lang=en", "Accept-Language": "zh-CN" }, "/en/"],
  ["Chinese cookie override", { Cookie: "pref-lang=zh-CN", "Accept-Language": "en-US" }, "/zh-CN/"],
  ["Invalid cookie ignored", { Cookie: "pref-lang=javascript:alert(1)", "Accept-Language": "en-US" }, "/en/"],
] as const;

for (const [name, headers, pathname] of cases) {
  const response = redirect(headers);
  const location = new URL(response.headers.get("Location")!);
  assert.equal(response.status, 302, name);
  assert.equal(location.pathname, pathname, name);
  assert.equal(response.headers.get("Cache-Control"), "private, no-store", name);
  assert.equal(response.headers.get("Vary"), "Cookie, Accept-Language", name);
  console.log(`PASS ${name} -> ${pathname}`);
}

const queryResponse = redirect({ "Accept-Language": "en" }, "?from=campaign");
assert.equal(new URL(queryResponse.headers.get("Location")!).search, "?from=campaign");
console.log("PASS query string preserved");
