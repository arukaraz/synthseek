import { describe, it, expect } from "vitest";

import { extractAppCode } from "../appCode";

describe("extractAppCode", () => {
  it("returns the code from a well-formed tRPC error envelope", () => {
    const error = { data: { appCode: "EMAIL_TAKEN" } };
    expect(extractAppCode(error)).toBe("EMAIL_TAKEN");
  });

  it("returns null when appCode is null", () => {
    expect(extractAppCode({ data: { appCode: null } })).toBeNull();
  });

  it("returns null when appCode is missing", () => {
    expect(extractAppCode({ data: {} })).toBeNull();
  });

  it("returns null when data is missing", () => {
    expect(extractAppCode({ message: "boom" })).toBeNull();
  });

  it("returns null for an unknown code not in the catalog", () => {
    expect(extractAppCode({ data: { appCode: "NOT_A_REAL_CODE" } })).toBeNull();
  });

  it("returns null for null, undefined, and primitives", () => {
    expect(extractAppCode(null)).toBeNull();
    expect(extractAppCode(undefined)).toBeNull();
    expect(extractAppCode("EMAIL_TAKEN")).toBeNull();
    expect(extractAppCode(42)).toBeNull();
  });

  it("returns the code from a real Error instance carrying data", () => {
    const error = Object.assign(new Error("Album not found"), {
      data: { appCode: "ALBUM_NOT_FOUND" },
    });
    expect(extractAppCode(error)).toBe("ALBUM_NOT_FOUND");
  });
});
