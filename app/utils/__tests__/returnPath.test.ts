import { describe, expect, it } from "vitest";

import { HOME_PATH, isSafeReturnPath, loginHrefFor, loginHrefToSetup, returnPathOf } from "../returnPath";

describe("isSafeReturnPath", () => {
  it.each([
    "/",
    "/library",
    "/library?tab=albums&page=2",
    "/settings/account#account.logout",
    "/oauth/consent?grant=abc123",
    "/search?q=%2F%2Fevil.example",
    "/artists/ab%2Fcd",
    "/setup",
    "/setup?question=media",
  ])("accepts the same-origin path %s", (path) => {
    expect(isSafeReturnPath(path)).toBe(true);
  });

  it.each([
    ["a protocol-relative host", "//evil.example"],
    ["a protocol-relative host with a path", "//evil.example/library"],
    ["a backslash host", "\\\\evil.example"],
    ["a slash then a backslash host", "/\\evil.example"],
    ["a backslash anywhere in the path", "/library\\..\\evil"],
    ["an absolute URL", "https://evil.example/library"],
    ["an absolute URL on this scheme", "http://localhost/library"],
    ["a script URL", "javascript:alert(1)"],
    ["a data URL", "data:text/html,hi"],
    ["a relative path with no leading slash", "library"],
    ["a path with leading whitespace", " /library"],
    ["a tab that browsers strip into a protocol-relative host", "/\t/evil.example"],
    ["a newline", "/library\nSet-Cookie: x=1"],
    ["a carriage return", "/library\rx"],
    ["a null character", "/library\u0000"],
    ["a delete character", "/library\u007f"],
    ["a C1 control character", "/library\u0085"],
    ["an empty value", ""],
    ["the sign-in page itself", "/login"],
    ["the sign-in page with a query", "/login?next=%2Flibrary"],
    ["the sign-in page with a trailing slash", "/login/"],
    ["the sign-in page spelled with an escape", "/%6Cogin"],
    ["a path that is too long", `/${"a".repeat(2048)}`],
  ])("rejects %s", (_name, value) => {
    expect(isSafeReturnPath(value)).toBe(false);
  });

  it("rejects values that are not strings", () => {
    expect(isSafeReturnPath(null)).toBe(false);
    expect(isSafeReturnPath(undefined)).toBe(false);
    expect(isSafeReturnPath(42)).toBe(false);
  });

  it("accepts a path of exactly the longest length", () => {
    expect(isSafeReturnPath(`/${"a".repeat(2047)}`)).toBe(true);
  });
});

describe("returnPathOf", () => {
  it("reads the next parameter and decodes it", () => {
    expect(returnPathOf("?next=%2Flibrary%3Ftab%3Dalbums")).toBe("/library?tab=albums");
  });

  it("keeps an oauth consent grant intact", () => {
    expect(returnPathOf(`?next=${encodeURIComponent("/oauth/consent?grant=g-1")}`)).toBe("/oauth/consent?grant=g-1");
  });

  it("falls back to home when there is no parameter", () => {
    expect(returnPathOf("")).toBe(HOME_PATH);
    expect(returnPathOf("?other=1")).toBe(HOME_PATH);
  });

  it("falls back to home for a hostile destination", () => {
    expect(returnPathOf("?next=%2F%2Fevil.example")).toBe(HOME_PATH);
    expect(returnPathOf("?next=%5C%5Cevil.example")).toBe(HOME_PATH);
    expect(returnPathOf("?next=https%3A%2F%2Fevil.example")).toBe(HOME_PATH);
    expect(returnPathOf("?next=%2F%09%2Fevil.example")).toBe(HOME_PATH);
  });
});

describe("loginHrefFor", () => {
  it("sends the visitor to a plain sign-in from the home page", () => {
    expect(loginHrefFor({ pathname: "/", search: "", hash: "" })).toBe("/login");
  });

  it("carries a deep link with its query and hash", () => {
    const href = loginHrefFor({ pathname: "/library", search: "?tab=albums", hash: "#top" });

    expect(href).toBe(`/login?next=${encodeURIComponent("/library?tab=albums#top")}`);
    expect(returnPathOf(href.slice(href.indexOf("?")))).toBe("/library?tab=albums#top");
  });

  it("carries the oauth consent grant", () => {
    const href = loginHrefFor({ pathname: "/oauth/consent", search: "?grant=g-1", hash: "" });

    expect(returnPathOf(href.slice(href.indexOf("?")))).toBe("/oauth/consent?grant=g-1");
  });

  it("leaves out a location that would not be a safe return path", () => {
    expect(loginHrefFor({ pathname: "//evil.example", search: "", hash: "" })).toBe("/login");
  });

  it("brings a signed-out visitor of the first-run setup back to the question they were on", () => {
    const href = loginHrefFor({ pathname: "/setup", search: "?question=media&server=plex", hash: "" });

    expect(returnPathOf(href.slice(href.indexOf("?")))).toBe("/setup?question=media&server=plex");
  });

  it("builds the sign-in address that returns to the first-run setup", () => {
    const href = loginHrefToSetup();

    expect(href).toBe("/login?next=%2Fsetup");
    expect(returnPathOf(href.slice(href.indexOf("?")))).toBe("/setup");
  });
});
