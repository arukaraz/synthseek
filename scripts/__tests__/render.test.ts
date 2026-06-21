import { describe, it, expect } from "vitest";

import { formatDate, renderChangelog } from "../changelog/render";
import { changelogSchema } from "../changelog/schema";
import type { Changelog } from "../changelog/types";

function fixture(): Changelog {
  return {
    schemaVersion: 1,
    versions: [
      {
        version: "2.0.0",
        date: "2026-06-05",
        type: "major",
        title: "Headline feature",
        callouts: [
          { level: "important", body: "First line.\n\nSecond paragraph." },
          { level: "warning", body: "Back up first." },
        ],
        sections: [
          {
            body: "Lead paragraph under the title.",
            items: ["First bullet.", "Second bullet."],
          },
          {
            body: "Continuation paragraph, still under the title, no separator before it.",
          },
          {
            heading: "Fixes and improvements",
            category: "fix",
            items: ["Fixed a thing ([#7](https://github.com/arukaraz/synthseek/issues/7))."],
          },
        ],
        issues: [7],
      },
      {
        version: "1.9.0",
        date: "2026-01-09",
        type: "minor",
        title: "Older release",
        sections: [{ body: "Just some prose." }],
      },
    ],
  };
}

describe("formatDate", () => {
  it("renders an ISO date as a long English date", () => {
    expect(formatDate("2026-06-05")).toBe("June 5, 2026");
    expect(formatDate("2026-01-09")).toBe("January 9, 2026");
    expect(formatDate("2026-12-31")).toBe("December 31, 2026");
  });

  it("throws on an out-of-range month", () => {
    expect(() => formatDate("2026-13-01")).toThrow();
  });
});

describe("renderChangelog", () => {
  const markdown = renderChangelog(fixture());

  it("starts with the document title and a separator", () => {
    expect(markdown.startsWith("# Patch Notes\n\n---\n\n")).toBe(true);
  });

  it("renders version headings with comma dated titles", () => {
    expect(markdown).toContain("# v2.0.0, June 5, 2026");
    expect(markdown).toContain("# v1.9.0, January 9, 2026");
  });

  it("renders the version title as the lead section heading", () => {
    expect(markdown).toContain("### Headline feature");
  });

  it("renders callouts as GitHub admonitions", () => {
    expect(markdown).toContain("> [!IMPORTANT]");
    expect(markdown).toContain("> [!WARNING]");
  });

  it("quotes blank lines inside a callout body with a bare marker", () => {
    expect(markdown).toContain("> First line.\n>\n> Second paragraph.");
  });

  it("renders items as markdown bullets", () => {
    expect(markdown).toContain("- First bullet.");
    expect(markdown).toContain("- Second bullet.");
  });

  it("renders headed sections with a triple-hash heading", () => {
    expect(markdown).toContain("### Fixes and improvements");
  });

  it("separates headed sections with a horizontal rule", () => {
    expect(markdown).toContain(
      "Continuation paragraph, still under the title, no separator before it.\n\n---\n\n### Fixes and improvements"
    );
  });

  it("joins continuation sections without a separator", () => {
    expect(markdown).toContain("- Second bullet.\n\nContinuation paragraph, still under the title");
  });

  it("separates versions with a horizontal rule and ends with a newline", () => {
    expect(markdown).toContain("\n\n---\n\n# v1.9.0");
    expect(markdown.endsWith("Just some prose.\n")).toBe(true);
  });

  it("preserves issue links inside item bodies", () => {
    expect(markdown).toContain("([#7](https://github.com/arukaraz/synthseek/issues/7))");
  });
});

describe("changelogSchema", () => {
  it("accepts a well-formed changelog", () => {
    expect(() => changelogSchema.parse(fixture())).not.toThrow();
  });

  it("rejects an unknown callout level", () => {
    const bad = fixture();
    const result = changelogSchema.safeParse({
      ...bad,
      versions: [{ ...bad.versions[0], callouts: [{ level: "critical", body: "x" }] }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing required version field", () => {
    const result = changelogSchema.safeParse({
      schemaVersion: 1,
      versions: [{ date: "2026-06-05", type: "patch", title: "x" }],
    });
    expect(result.success).toBe(false);
  });
});
