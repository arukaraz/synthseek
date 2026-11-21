// @vitest-environment node
import { describe, expect, it } from "vitest";

import { THEME_FONTS_PATH } from "../constants";
import { fontFaceBlock, fontFamilyOf, isFontFile } from "../fonts";

describe("isFontFile", () => {
  it.each(["Inter.woff2", "My.Font-Bold.ttf", "a_b.otf", "9lives.woff"])("accepts %s", (file) => {
    expect(isFontFile(file)).toBe(true);
  });

  it.each([
    ["an empty name", ""],
    ["no extension", "Inter"],
    ["a foreign extension", "Inter.svg"],
    ["an upper case extension", "Inter.WOFF2"],
    ["a leading dot", ".woff2"],
    ["a leading dash", "-x.woff2"],
    ["a path", "fonts/Inter.woff2"],
    ["a climbing path", "../Inter.woff2"],
    ["a quote", 'In"ter.woff2'],
    ["a space", "In ter.woff2"],
    ["a closing parenthesis", "In)ter.woff2"],
    ["a name past the cap", `${"a".repeat(60)}.woff2`],
  ])("refuses %s", (_label, file) => {
    expect(isFontFile(file)).toBe(false);
  });
});

describe("fontFamilyOf", () => {
  it("names a font after its file without the extension", () => {
    expect(fontFamilyOf("Inter.woff2")).toBe("Inter");
    expect(fontFamilyOf("My.Font-Bold.ttf")).toBe("My.Font-Bold");
    expect(fontFamilyOf("plain")).toBe("plain");
  });
});

describe("fontFaceBlock", () => {
  it("declares one face per uploaded font, named after its file", () => {
    expect(fontFaceBlock(["Inter.woff2", "Mono.ttf"])).toBe(
      [
        `@font-face{font-family:"Inter";src:url("${THEME_FONTS_PATH}/Inter.woff2");font-display:swap}`,
        `@font-face{font-family:"Mono";src:url("${THEME_FONTS_PATH}/Mono.ttf");font-display:swap}`,
      ].join("\n")
    );
  });

  it("leaves out a name that could not be a font the server stored", () => {
    expect(fontFaceBlock(['x");}body{display:none}.woff2', "Inter.woff2"])).toBe(
      `@font-face{font-family:"Inter";src:url("${THEME_FONTS_PATH}/Inter.woff2");font-display:swap}`
    );
  });

  it("is empty when there is no font", () => {
    expect(fontFaceBlock([])).toBe("");
  });
});
