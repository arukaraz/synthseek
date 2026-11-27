import { describe, expect, it } from "vitest";

import { docsUrlFor } from "../docs-url";

describe("docsUrlFor", () => {
  it("links a stable build to the stable docs", () => {
    expect(docsUrlFor("custom-themes/", "stable", "2.9.4")).toBe("https://docs.synthseek.dev/custom-themes/");
  });

  it("links a beta build to the beta docs of its major version", () => {
    expect(docsUrlFor("custom-themes/", "beta", "3.0.0")).toBe("https://docs.synthseek.dev/v3-beta/custom-themes/");
    expect(docsUrlFor("/widget-templates", "beta", "4.1.0")).toBe(
      "https://docs.synthseek.dev/v4-beta/widget-templates"
    );
  });

  it("falls back to the stable docs when the channel is missing or unknown", () => {
    expect(docsUrlFor("faq/", undefined, "3.0.0")).toBe("https://docs.synthseek.dev/faq/");
    expect(docsUrlFor("faq/", "nightly", "3.0.0")).toBe("https://docs.synthseek.dev/faq/");
  });

  it("falls back to the stable docs when the version is unknown", () => {
    expect(docsUrlFor("faq/", "beta", "")).toBe("https://docs.synthseek.dev/faq/");
  });
});
