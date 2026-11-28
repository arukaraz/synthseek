import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { applyTextSize, readTextSize, writeTextSize } from "../browser";
import { DEFAULT_TEXT_SIZE, TEXT_SIZE_ATTRIBUTE, TEXT_SIZE_COOKIE, TEXT_SIZES } from "../constants";
import { parseTextSize, textSizeAttributesOf } from "../helpers";

function clear(): void {
  document.cookie = `${TEXT_SIZE_COOKIE}=; Path=/; Max-Age=0`;
  document.documentElement.removeAttribute(TEXT_SIZE_ATTRIBUTE);
}

beforeEach(clear);
afterEach(clear);

describe("parseTextSize", () => {
  it.each(TEXT_SIZES)("reads %s", (size) => {
    expect(parseTextSize(size)).toBe(size);
  });

  it.each([undefined, null, "", "huge", "LARGE", "1.5", "large "])("falls back to normal for %j", (value) => {
    expect(parseTextSize(value)).toBe(DEFAULT_TEXT_SIZE);
  });
});

describe("textSizeAttributesOf", () => {
  it("writes nothing for the default, so a page nobody changed carries no attribute", () => {
    expect(textSizeAttributesOf("normal")).toEqual({});
  });

  it.each(TEXT_SIZES.filter((size) => size !== "normal"))("writes the attribute for %s", (size) => {
    expect(textSizeAttributesOf(size)).toEqual({ [TEXT_SIZE_ATTRIBUTE]: size });
  });
});

describe("the per-browser cookie", () => {
  it("reads normal when nothing was ever stored", () => {
    expect(readTextSize()).toBe("normal");
  });

  it.each(TEXT_SIZES)("round trips %s", (size) => {
    writeTextSize(size);

    expect(readTextSize()).toBe(size);
  });

  it("ignores a cookie it did not write", () => {
    document.cookie = `${TEXT_SIZE_COOKIE}=gigantic; Path=/`;

    expect(readTextSize()).toBe("normal");
  });

  it("does not touch the accessibility cookie the account choices use", () => {
    document.cookie = "a11y=1.a.a.a.0; Path=/";

    writeTextSize("large");

    expect(document.cookie).toContain("a11y=1.a.a.a.0");
    document.cookie = "a11y=; Path=/; Max-Age=0";
  });
});

describe("applyTextSize", () => {
  it("sets the root attribute for a larger size", () => {
    applyTextSize(document.documentElement, "larger");

    expect(document.documentElement.getAttribute(TEXT_SIZE_ATTRIBUTE)).toBe("larger");
  });

  it("removes the root attribute when the size goes back to normal", () => {
    applyTextSize(document.documentElement, "largest");

    applyTextSize(document.documentElement, "normal");

    expect(document.documentElement.hasAttribute(TEXT_SIZE_ATTRIBUTE)).toBe(false);
  });
});
