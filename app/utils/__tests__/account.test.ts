import { describe, expect, it } from "vitest";

import { isValidPassword, isValidUsername } from "../account";

describe("isValidUsername", () => {
  it("accepts a username from 3 to 32 characters", () => {
    expect(isValidUsername("abc")).toBe(true);
    expect(isValidUsername("a".repeat(32))).toBe(true);
  });

  it("rejects a username shorter than 3 or longer than 32 characters", () => {
    expect(isValidUsername("ab")).toBe(false);
    expect(isValidUsername("a".repeat(33))).toBe(false);
  });

  it("does not let surrounding spaces make a short username long enough", () => {
    expect(isValidUsername("  ab  ")).toBe(false);
  });
});

describe("isValidPassword", () => {
  it("accepts a password of at least 8 characters and rejects a shorter one", () => {
    expect(isValidPassword("12345678")).toBe(true);
    expect(isValidPassword("1234567")).toBe(false);
  });
});
