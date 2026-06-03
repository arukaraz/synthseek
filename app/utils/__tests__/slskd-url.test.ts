import { describe, it, expect } from "vitest";

import { validateSlskdApiUrl } from "../slskd-url";

describe("validateSlskdApiUrl", () => {
  it("accepts a base http URL", () => {
    const result = validateSlskdApiUrl("http://localhost:5030");

    expect(result.ok).toBe(true);
    expect(result.normalized).toBe("http://localhost:5030");
    expect(result.error).toBeUndefined();
    expect(result.warning).toBeUndefined();
  });

  it("accepts a base https URL", () => {
    const result = validateSlskdApiUrl("https://slskd.example.com");

    expect(result.ok).toBe(true);
    expect(result.normalized).toBe("https://slskd.example.com");
    expect(result.warning).toBeUndefined();
  });

  it("trims surrounding whitespace", () => {
    const result = validateSlskdApiUrl("   http://localhost:5030   ");

    expect(result.ok).toBe(true);
    expect(result.normalized).toBe("http://localhost:5030");
  });

  it("strips a trailing slash on the root path", () => {
    const result = validateSlskdApiUrl("http://localhost:5030/");

    expect(result.ok).toBe(true);
    expect(result.normalized).toBe("http://localhost:5030");
    expect(result.warning).toBeUndefined();
  });

  it("strips a trailing slash on a base-path URL while keeping the path warning", () => {
    const result = validateSlskdApiUrl("http://host/slskd/");

    expect(result.ok).toBe(true);
    expect(result.normalized).toBe("http://host/slskd");
    expect(result.warning).toBeDefined();
  });

  it("returns a hard error when the scheme is missing", () => {
    const result = validateSlskdApiUrl("localhost:5030");

    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.warning).toBeUndefined();
  });

  it("returns a hard error for a non-http(s) scheme", () => {
    const result = validateSlskdApiUrl("ftp://localhost:5030");

    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("returns a hard error for an empty value", () => {
    const result = validateSlskdApiUrl("   ");

    expect(result.ok).toBe(false);
    expect(result.normalized).toBe("");
    expect(result.error).toBeDefined();
  });

  it("returns a hard error for garbage input", () => {
    const result = validateSlskdApiUrl("not a url at all");

    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("returns a soft warning when the URL carries a non-root path", () => {
    const result = validateSlskdApiUrl("https://host/searches");

    expect(result.ok).toBe(true);
    expect(result.normalized).toBe("https://host/searches");
    expect(result.warning).toBeDefined();
    expect(result.error).toBeUndefined();
  });

  it("does not warn when the URL only has a query or port but a root path", () => {
    const result = validateSlskdApiUrl("http://host:5030/?foo=bar");

    expect(result.ok).toBe(true);
    expect(result.warning).toBeUndefined();
  });
});
