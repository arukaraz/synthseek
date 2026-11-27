import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";

import { onRequest } from "../functions/v3-beta/[[path]].js";

const UPSTREAM = "https://beta.synthseek-docs.pages.dev";

let calls = [];
let reply = () => new Response("ok", { status: 200 });
const realFetch = globalThis.fetch;

beforeEach(() => {
  calls = [];
  reply = () => new Response("ok", { status: 200 });
  globalThis.fetch = async (target, init) => {
    calls.push({ url: String(target), init });
    return reply();
  };
});

afterEach(() => {
  globalThis.fetch = realFetch;
});

function request(path, init = {}) {
  return onRequest({ request: new Request(`https://docs.synthseek.dev${path}`, init) });
}

describe("beta docs proxy", () => {
  it("serves a beta page from the beta deployment", async () => {
    const response = await request("/v3-beta/faq?q=x");
    assert.equal(response.status, 200);
    assert.equal(calls[0].url, `${UPSTREAM}/faq?q=x`);
  });

  it("never leaves the beta origin for a path that starts with two slashes", async () => {
    await request("/v3-beta//attacker.example/page.html");
    assert.equal(calls.length, 1);
    assert.equal(new URL(calls[0].url).origin, UPSTREAM);
  });

  it("sends the bare beta address to its trailing slash without fetching", async () => {
    const response = await request("/v3-beta");
    assert.equal(response.status, 308);
    assert.equal(response.headers.get("location"), "/v3-beta/");
    assert.equal(calls.length, 0);
  });

  it("refuses a method other than GET and HEAD", async () => {
    const response = await request("/v3-beta/faq", { method: "POST", body: "x" });
    assert.equal(response.status, 405);
    assert.equal(calls.length, 0);
  });

  it("forwards no cookie and follows no redirect", async () => {
    await request("/v3-beta/faq", { headers: { cookie: "session=1", accept: "text/html" } });
    assert.equal(calls[0].init.headers.get("cookie"), null);
    assert.equal(calls[0].init.headers.get("accept"), "text/html");
    assert.equal(calls[0].init.redirect, "manual");
  });

  it("keeps an upstream redirect under the beta path", async () => {
    reply = () => new Response(null, { status: 308, headers: { location: `${UPSTREAM}/faq?a=1#h` } });
    const response = await request("/v3-beta/faq/");
    assert.equal(response.headers.get("location"), "/v3-beta/faq?a=1#h");
  });

  it("keeps a relative upstream redirect under the beta path", async () => {
    reply = () => new Response(null, { status: 308, headers: { location: "/faq/" } });
    const response = await request("/v3-beta/faq");
    assert.equal(response.headers.get("location"), "/v3-beta/faq/");
  });

  it("passes a redirect to another host through untouched", async () => {
    reply = () => new Response(null, { status: 302, headers: { location: "https://example.com/x" } });
    const response = await request("/v3-beta/x");
    assert.equal(response.headers.get("location"), "https://example.com/x");
    assert.equal(calls.length, 1);
  });
});
