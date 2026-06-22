import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { TimelineEntry } from "../TimelineEntry";
import { makeEntry } from "./fixtures";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
});

const noteEntry = makeEntry({ sections: [{ category: "feature", items: ["new thing"] }] });

describe("TimelineEntry", () => {
  it("renders the version tag and title for the latest variant", () => {
    render(<TimelineEntry entry={noteEntry} variant="latest" />);
    expect(screen.getByText(`v${noteEntry.version}`)).toBeInTheDocument();
    expect(screen.getByText(noteEntry.title)).toBeInTheDocument();
  });

  it("shows the new badge for the latest and new variants", () => {
    const { rerender } = render(<TimelineEntry entry={noteEntry} variant="latest" />);
    expect(screen.getByText(enSettings.updates.badge.new)).toBeInTheDocument();

    rerender(<TimelineEntry entry={noteEntry} variant="new" />);
    expect(screen.getByText(enSettings.updates.badge.new)).toBeInTheDocument();
  });

  it("shows the current badge for the current variant", () => {
    render(<TimelineEntry entry={noteEntry} variant="current" />);
    expect(screen.getByText(enSettings.updates.badge.current)).toBeInTheDocument();
    expect(screen.queryByText(enSettings.updates.badge.new)).not.toBeInTheDocument();
  });

  it("renders the entry body inline for non-past variants", () => {
    render(<TimelineEntry entry={noteEntry} variant="current" />);
    expect(screen.getByText("new thing")).toBeInTheDocument();
  });

  it("keeps the past variant body collapsed until expanded", async () => {
    render(<TimelineEntry entry={noteEntry} variant="past" />);

    const toggle = screen.getByRole("button", { name: enSettings.updates.notes.expand });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("new thing")).not.toBeInTheDocument();

    await userEvent.click(toggle);

    const collapse = screen.getByRole("button", { name: enSettings.updates.notes.collapse });
    expect(collapse).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("new thing")).toBeInTheDocument();
  });

  it("collapses the past variant body again on a second click", async () => {
    render(<TimelineEntry entry={noteEntry} variant="past" />);

    await userEvent.click(screen.getByRole("button", { name: enSettings.updates.notes.expand }));
    await userEvent.click(screen.getByRole("button", { name: enSettings.updates.notes.collapse }));

    expect(screen.queryByText("new thing")).not.toBeInTheDocument();
  });
});
