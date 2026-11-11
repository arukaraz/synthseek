import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { EntryBody } from "../EntryBody";
import { REPO_ISSUES_URL } from "../constants";
import { makeEntry } from "./fixtures";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
});

describe("EntryBody", () => {
  it("renders nothing for an entry without callouts, notes, or issues", () => {
    const { container } = render(<EntryBody entry={makeEntry()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a callout with its localized label and body", () => {
    render(<EntryBody entry={makeEntry({ callouts: [{ level: "warning", body: "be careful" }] })} />);
    expect(screen.getByText(enSettings.updates.notes.callout.warning)).toBeInTheDocument();
    expect(screen.getByText("be careful")).toBeInTheDocument();
  });

  it("flattens section items into note lines with localized category chips", () => {
    render(
      <EntryBody
        entry={makeEntry({
          sections: [{ category: "fix", items: ["fixed a crash", "patched a leak"] }],
        })}
      />
    );
    expect(screen.getAllByText(enSettings.updates.notes.category.fix)).toHaveLength(2);
    expect(screen.getByText("fixed a crash")).toBeInTheDocument();
    expect(screen.getByText("patched a leak")).toBeInTheDocument();
  });

  it("renders a category-less body section without a chip", () => {
    render(<EntryBody entry={makeEntry({ sections: [{ body: "general prose note" }] })} />);
    expect(screen.getByText("general prose note")).toBeInTheDocument();
    expect(screen.queryByText(enSettings.updates.notes.category.chore)).not.toBeInTheDocument();
  });

  it("renders resolved issue links pointing at the repo issues url", () => {
    render(<EntryBody entry={makeEntry({ issues: [12, 34] })} />);
    expect(screen.getByText(enSettings.updates.notes.resolves)).toBeInTheDocument();

    const first = screen.getByRole("link", { name: "#12" });
    expect(first).toHaveAttribute("href", `${REPO_ISSUES_URL}/12`);
    expect(first).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByRole("link", { name: "#34" })).toHaveAttribute("href", `${REPO_ISSUES_URL}/34`);
  });
});
