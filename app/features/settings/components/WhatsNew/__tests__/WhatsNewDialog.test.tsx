import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { WhatsNewDialog } from "../WhatsNewDialog";
import { makeWhatsNewEntry } from "./fixtures";

const copy = enSettings.updates.whatsNew;

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
});

describe("WhatsNewDialog", () => {
  it("opens on the first highlight under the heading and the version", () => {
    render(<WhatsNewDialog entry={makeWhatsNewEntry()} mediaPath={null} open onOpenChange={vi.fn()} />);

    expect(screen.getByRole("heading", { name: copy.heading })).toBeInTheDocument();
    expect(screen.getByText("v3.0.0")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "The Stage" })).toBeInTheDocument();
    expect(screen.getByText("1 of 3")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: copy.tryIt })).toHaveAttribute("href", "/library");
  });

  it("puts the focus on the primary action when it opens", () => {
    render(<WhatsNewDialog entry={makeWhatsNewEntry()} mediaPath={null} open onOpenChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: copy.next })).toHaveFocus();
  });

  it("walks the highlights and ends on the summary card", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<WhatsNewDialog entry={makeWhatsNewEntry()} mediaPath={null} open onOpenChange={onOpenChange} />);

    await user.click(screen.getByRole("button", { name: copy.next }));
    expect(screen.getByRole("heading", { name: "Presets for requests" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: copy.tryIt })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: copy.next }));
    expect(screen.getByRole("heading", { name: copy.summaryTitle })).toBeInTheDocument();
    expect(screen.getByText("The queue keeps its order after a restart.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: copy.fullChangelog })).toHaveAttribute("href", "/settings/updates");

    await user.click(screen.getByRole("button", { name: copy.done }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("goes back a card and jumps to a card from the progress bar", async () => {
    const user = userEvent.setup();
    render(<WhatsNewDialog entry={makeWhatsNewEntry()} mediaPath={null} open onOpenChange={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Go to 3 of 3" }));
    expect(screen.getByRole("heading", { name: copy.summaryTitle })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: copy.back }));
    expect(screen.getByRole("heading", { name: "Presets for requests" })).toBeInTheDocument();
  });

  it("moves between cards with the arrow keys", () => {
    render(<WhatsNewDialog entry={makeWhatsNewEntry()} mediaPath={null} open onOpenChange={vi.fn()} />);
    const dialog = screen.getByRole("dialog");

    fireEvent.keyDown(dialog, { key: "ArrowRight" });
    expect(screen.getByRole("heading", { name: "Presets for requests" })).toBeInTheDocument();

    fireEvent.keyDown(dialog, { key: "ArrowLeft" });
    fireEvent.keyDown(dialog, { key: "ArrowLeft" });
    expect(screen.getByRole("heading", { name: "The Stage" })).toBeInTheDocument();
  });

  it("shows a single card titled with the release when there are no highlights", () => {
    render(
      <WhatsNewDialog
        entry={makeWhatsNewEntry({ highlights: undefined })}
        mediaPath={null}
        open
        onOpenChange={vi.fn()}
      />
    );

    expect(screen.getByRole("heading", { name: "A whole new Synthseek" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Go to/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: copy.done })).toBeInTheDocument();
  });

  it("shows a highlight's media through the server's media path", () => {
    const entry = makeWhatsNewEntry({
      highlights: [
        {
          title: "The Stage",
          body: "Your music, full screen.",
          media: { type: "image", file: "stage.png", alt: "The Stage player" },
        },
      ],
    });
    render(<WhatsNewDialog entry={entry} mediaPath="/api/v1/whats-new/media/3.0.0" open onOpenChange={vi.fn()} />);

    expect(screen.getByRole("img", { name: "The Stage player" })).toHaveAttribute(
      "src",
      expect.stringContaining("/api/v1/whats-new/media/3.0.0/stage.png")
    );
  });

  it("closes when a highlight's link is followed", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<WhatsNewDialog entry={makeWhatsNewEntry()} mediaPath={null} open onOpenChange={onOpenChange} />);

    await user.click(screen.getByRole("link", { name: copy.tryIt }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
