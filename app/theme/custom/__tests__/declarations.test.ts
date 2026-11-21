// @vitest-environment node
import { describe, expect, it } from "vitest";

import { scanDeclarations, setDeclaration, valuesOf } from "../declarations";

function pairs(css: string): [string, string][] {
  return scanDeclarations(css).map((declaration) => [declaration.name, declaration.value]);
}

describe("scanDeclarations", () => {
  it("reads the declarations of a root rule with trimmed values", () => {
    expect(pairs(":root {\n  --a:   1;\n  --b: calc(1px  +  2px) ;\n}")).toEqual([
      ["--a", "1"],
      ["--b", "calc(1px  +  2px)"],
    ]);
  });

  it("reports the offsets of the trimmed value", () => {
    const css = ":root {  --a :   one two  ;}";
    const [declaration] = scanDeclarations(css);
    expect(css.slice(declaration.valueStart, declaration.valueEnd)).toBe("one two");
    expect(declaration.value).toBe("one two");
  });

  it("skips a semicolon and a brace inside a string", () => {
    expect(pairs(":root { --a: \"x;}y\"; --b: 'p;q'; --c: 1 }")).toEqual([
      ["--a", '"x;}y"'],
      ["--b", "'p;q'"],
      ["--c", "1"],
    ]);
  });

  it("honours an escaped quote inside a string", () => {
    expect(pairs(':root { --a: "x\\";y"; --b: 2; }')).toEqual([
      ["--a", '"x\\";y"'],
      ["--b", "2"],
    ]);
  });

  it("skips declarations and terminators inside comments", () => {
    expect(pairs(":root { /* --x: 1; */ --a: 1 /* ; } */; --b: 2; }")).toEqual([
      ["--a", "1 /* ; } */"],
      ["--b", "2"],
    ]);
  });

  it("counts a declaration the closing brace ends without a semicolon", () => {
    expect(pairs(":root { --a: 1; --b: 2 }")).toEqual([
      ["--a", "1"],
      ["--b", "2"],
    ]);
  });

  it("counts a declaration at the end of an unterminated rule", () => {
    expect(pairs(":root { --a: 1; --b: 2")).toEqual([
      ["--a", "1"],
      ["--b", "2"],
    ]);
  });

  it("reads every root rule, in order", () => {
    expect(pairs(":root { --a: 1; }\n:root { --a: 2; --b: 3; }")).toEqual([
      ["--a", "1"],
      ["--a", "2"],
      ["--b", "3"],
    ]);
  });

  it("ignores rules whose selector is not exactly root", () => {
    expect(pairs(".x { --a: 1; } :root .y { --b: 2; } :root, a { --c: 3; } :root { --d: 4; }")).toEqual([["--d", "4"]]);
  });

  it("ignores a root rule nested in an at-rule", () => {
    expect(pairs("@media (min-width: 1px) { :root { --a: 1; } } :root { --b: 2; }")).toEqual([["--b", "2"]]);
  });

  it("recognises a root selector written around a comment", () => {
    expect(pairs("/* head */ :root /* tail */ { --a: 1; }")).toEqual([["--a", "1"]]);
  });

  it("ignores ordinary properties and a block nested in a root rule", () => {
    expect(pairs(":root { color: red; --a: 1; .n { --z: 9; } --b: 2; }")).toEqual([
      ["--a", "1"],
      ["--b", "2"],
    ]);
  });

  it("keeps an empty value", () => {
    expect(pairs(":root { --a: ; --b:; }")).toEqual([
      ["--a", ""],
      ["--b", ""],
    ]);
  });

  it("recovers after a top-level statement", () => {
    expect(pairs('@import "x;y"; :root { --a: 1; }')).toEqual([["--a", "1"]]);
  });

  it("returns nothing for an empty file", () => {
    expect(scanDeclarations("")).toEqual([]);
  });
});

describe("valuesOf", () => {
  it("lets the last declaration of a name win", () => {
    const values = valuesOf(":root { --a: 1; --b: 2; }\n:root { --a: 3; }");
    expect(values.get("--a")).toBe("3");
    expect(values.get("--b")).toBe("2");
    expect(values.size).toBe(2);
  });
});

describe("setDeclaration", () => {
  function expectOnlyReplaced(before: string, after: string, replaced: string, by: string): void {
    const start = before.indexOf(replaced);
    expect(after.slice(0, start)).toBe(before.slice(0, start));
    expect(after.slice(start, start + by.length)).toBe(by);
    expect(after.slice(start + by.length)).toBe(before.slice(start + replaced.length));
  }

  it("replaces the value in place and leaves every other byte alone", () => {
    const css = '/* head */\n:root {\n  --a: 1;\n  --b:   "x;y"  ;  /* keep */\n  --c: 3 }\n.z { --b: 9 }\n';
    expectOnlyReplaced(css, setDeclaration(css, "--b", "two  words"), '"x;y"', "two  words");
  });

  it("replaces the last declaration of a name", () => {
    const css = ":root { --a: 1; }\n:root { --a: 2; }\n";
    const next = setDeclaration(css, "--a", "9");
    expect(next).toBe(":root { --a: 1; }\n:root { --a: 9; }\n");
  });

  it("replaces a value with an empty one and from an empty one", () => {
    expect(setDeclaration(":root { --a: 1; }", "--a", "")).toBe(":root { --a: ; }");
    expect(valuesOf(setDeclaration(":root { --a: ; }", "--a", "5")).get("--a")).toBe("5");
  });

  it("inserts a missing name on its own line before the closing brace", () => {
    const css = ":root {\n  --a: 1;\n}\n";
    expect(setDeclaration(css, "--b", "2")).toBe(":root {\n  --a: 1;\n  --b: 2;\n}\n");
  });

  it("inserts into the last root rule only", () => {
    const css = ":root {\n  --a: 1;\n}\n:root {\n  --c: 3;\n}\n";
    expect(setDeclaration(css, "--b", "2")).toBe(":root {\n  --a: 1;\n}\n:root {\n  --c: 3;\n  --b: 2;\n}\n");
  });

  it("inserts into a one-line rule and keeps the result readable", () => {
    const next = setDeclaration(":root { --a: 1; }", "--b", "2");
    expect(valuesOf(next).get("--a")).toBe("1");
    expect(valuesOf(next).get("--b")).toBe("2");
    expect(next.startsWith(":root { --a: 1; ")).toBe(true);
  });

  it("inserts into an empty rule", () => {
    expect(valuesOf(setDeclaration(":root {}", "--a", "1")).get("--a")).toBe("1");
  });

  it("closes the previous declaration when it had no semicolon", () => {
    const next = setDeclaration(":root {\n  --a: 1\n}\n", "--b", "2");
    expect(next).toBe(":root {\n  --a: 1;\n  --b: 2;\n}\n");
  });

  it("completes an unterminated rule", () => {
    const next = setDeclaration(":root {\n  --a: 1;", "--b", "2");
    expect(next).toBe(":root {\n  --a: 1;\n  --b: 2;\n}");
    expect(valuesOf(next).size).toBe(2);
  });

  it("appends a root rule when there is none", () => {
    expect(setDeclaration("", "--a", "1")).toBe(":root {\n  --a: 1;\n}\n");
    expect(setDeclaration(".x { --a: 0; }\n", "--a", "1")).toBe(".x { --a: 0; }\n:root {\n  --a: 1;\n}\n");
    expect(setDeclaration(".x { }", "--a", "1")).toBe(".x { }\n:root {\n  --a: 1;\n}\n");
  });

  it("does not match a name that is only a prefix", () => {
    const next = setDeclaration(":root { --ab: 1; }", "--a", "2");
    expect(valuesOf(next).get("--ab")).toBe("1");
    expect(valuesOf(next).get("--a")).toBe("2");
  });

  it.each([
    ["a semicolon", "1; color: red"],
    ["an opening brace", "1 { x"],
    ["a closing brace", "1 }"],
    ["a newline", "1\n2"],
    ["a carriage return", "1\r2"],
    ["a comment opener", "1 /* x"],
    ["an unterminated string", '"abc'],
  ])("refuses a value with %s", (_label, value) => {
    const css = ":root { --a: 1; }";
    expect(setDeclaration(css, "--a", value)).toBe(css);
    expect(setDeclaration(css, "--b", value)).toBe(css);
  });

  it("accepts a quoted value that holds a comma and a space", () => {
    const next = setDeclaration(":root { --a: 1; }", "--f", 'ui-sans-serif, "Segoe UI", sans-serif');
    expect(valuesOf(next).get("--f")).toBe('ui-sans-serif, "Segoe UI", sans-serif');
  });

  it("refuses a name that is not a custom property", () => {
    const css = ":root { --a: 1; }";
    expect(setDeclaration(css, "color", "red")).toBe(css);
    expect(setDeclaration(css, "--", "red")).toBe(css);
  });
});
