// @vitest-environment node
import { describe, expect, it } from "vitest";

import { THEME_SCOPE_SELECTOR } from "../constants";
import { isInertValue, tokenBlock, tokenVars } from "../sheet";

import { oklch } from "./fixtures";

describe("isInertValue", () => {
  it.each([
    "url(x)",
    "URL(x)",
    "image-set(a 1x)",
    "image(a)",
    "cross-fade(a, b)",
    "src(a)",
    "a\\b",
    "a @import b",
    "</style>",
    "a;b",
    "a{b",
    "a}b",
  ])("refuses %s", (value) => {
    expect(isInertValue(value)).toBe(false);
  });

  it("accepts plain values, colors and font stacks", () => {
    expect(isInertValue(oklch("0.5 0.1 200 / 0.4"))).toBe(true);
    expect(isInertValue('ui-sans-serif, "Segoe UI", sans-serif')).toBe(true);
    expect(isInertValue("calc(var(--a) * 2)")).toBe(true);
    expect(isInertValue("")).toBe(true);
  });
});

describe("tokenBlock", () => {
  const surfaces = { path: "tokens/surfaces.css", text: ":root {\n  --a: 1;\n  --b: 2rem;\n}\n" };
  const brand = { path: "tokens/brand.css", text: ":root { --c: red }" };

  it("builds one scoped rule from every file, in the order given", () => {
    expect(tokenBlock([surfaces, brand])).toBe(`${THEME_SCOPE_SELECTOR}{--a:1;--b:2rem;--c:red}`);
    expect(tokenBlock([brand, surfaces])).toBe(`${THEME_SCOPE_SELECTOR}{--c:red;--a:1;--b:2rem}`);
  });

  it("drops a value that carries a resource function", () => {
    const risky = {
      path: "tokens/x.css",
      text: ":root { --ok: 1; --bad: url(https://x.test/a.png); --alsobad: IMAGE-SET(a 1x); }",
    };
    expect(tokenBlock([risky])).toBe(`${THEME_SCOPE_SELECTOR}{--ok:1}`);
  });

  it("drops a name that is not a plain custom property name", () => {
    const odd = { path: "tokens/x.css", text: ":root { --a.b: 1; --é: 2; --a_b-1: 3; --: 4; }" };
    expect(tokenBlock([odd])).toBe(`${THEME_SCOPE_SELECTOR}{--a_b-1:3}`);
  });

  it("ignores declarations outside the root rule and files outside the tokens folder", () => {
    const free = { path: "custom.css", text: ":root { --free: 1; }" };
    const nested = { path: "tokens/n.css", text: ".x { --n: 1; } :root { --r: 2; }" };
    expect(tokenBlock([free, nested])).toBe(`${THEME_SCOPE_SELECTOR}{--r:2}`);
  });

  it("is empty when nothing qualifies", () => {
    expect(tokenBlock([])).toBe("");
    expect(tokenBlock([{ path: "tokens/x.css", text: ":root { --a: url(x); }" }])).toBe("");
  });
});

describe("tokenVars", () => {
  it("gives the same tokens the block carries, as values an element can take inline", () => {
    const files = [
      { path: "tokens/surfaces.css", text: ":root {\n  --a: 1;\n  --b: 2rem;\n}\n" },
      { path: "tokens/x.css", text: ":root { --bad: url(https://x.test/a.png); --a.b: 1; --c: red }" },
      { path: "custom.css", text: ":root { --free: 1; }" },
    ];
    expect(tokenVars(files)).toEqual({ "--a": "1", "--b": "2rem", "--c": "red" });
  });

  it("keeps the last value when a token is declared twice", () => {
    expect(tokenVars([{ path: "tokens/x.css", text: ":root { --a: 1; --a: 2; }" }])).toEqual({ "--a": "2" });
  });

  it("is empty when nothing qualifies", () => {
    expect(tokenVars([])).toEqual({});
  });
});
