import { describe, it, expect } from "vitest";
import { TRPCClientError } from "@trpc/client";

import { getHttpStatusFromError, isHttpClientError } from "../trpc-error";

function clientErrorWithStatus(httpStatus: number): TRPCClientError<never> {
  const error = new TRPCClientError<never>("boom");
  Object.defineProperty(error, "data", {
    value: { httpStatus },
    configurable: true,
  });
  return error;
}

describe("getHttpStatusFromError", () => {
  it("returns undefined for a non-tRPC error", () => {
    expect(getHttpStatusFromError(new Error("plain"))).toBeUndefined();
  });

  it("returns undefined for a non-error value", () => {
    expect(getHttpStatusFromError("nope")).toBeUndefined();
    expect(getHttpStatusFromError(undefined)).toBeUndefined();
  });

  it("reads the http status off a tRPC client error", () => {
    expect(getHttpStatusFromError(clientErrorWithStatus(429))).toBe(429);
  });

  it("returns undefined when the tRPC error carries no data", () => {
    expect(getHttpStatusFromError(new TRPCClientError("boom"))).toBeUndefined();
  });
});

describe("isHttpClientError", () => {
  it("is true for 4xx statuses", () => {
    expect(isHttpClientError(clientErrorWithStatus(429))).toBe(true);
    expect(isHttpClientError(clientErrorWithStatus(401))).toBe(true);
    expect(isHttpClientError(clientErrorWithStatus(404))).toBe(true);
    expect(isHttpClientError(clientErrorWithStatus(400))).toBe(true);
    expect(isHttpClientError(clientErrorWithStatus(499))).toBe(true);
  });

  it("is false for 5xx statuses", () => {
    expect(isHttpClientError(clientErrorWithStatus(500))).toBe(false);
    expect(isHttpClientError(clientErrorWithStatus(503))).toBe(false);
  });

  it("is false for non-tRPC and network errors", () => {
    expect(isHttpClientError(new Error("network"))).toBe(false);
    expect(isHttpClientError(new TRPCClientError("no data"))).toBe(false);
  });
});
