import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

import { ActivityDivider } from "../ActivityDivider";
import type { ActivityDividerAnnouncements } from "../types";

const reducedMotion = vi.hoisted(() => ({ value: false }));

vi.mock("framer-motion", () => ({
  useReducedMotion: () => reducedMotion.value,
}));

const announcements: ActivityDividerAnnouncements = {
  start: "Started syncing",
  progress: "Synced 5 of 8",
  complete: "Finished, 8 of 8",
};

describe("ActivityDivider", () => {
  beforeEach(() => {
    reducedMotion.value = false;
  });

  it("renders an idle rail with no label or live announcement", () => {
    const { container } = render(<ActivityDivider state="idle" />);
    const rail = container.querySelector(".activity-rail");
    expect(rail).toHaveClass("activity-rail-idle");
    expect(screen.getByRole("status")).toHaveTextContent("");
  });

  it("renders the in-progress rail with faster motion and no label", () => {
    const { container } = render(<ActivityDivider state="in-progress" />);
    const rail = container.querySelector(".activity-rail");
    expect(rail).toHaveClass("activity-rail-progress");
    expect(screen.queryByText("Syncing all playlists to Plex")).not.toBeInTheDocument();
  });

  it("renders the plex-sync amber rail, the label, and the X/Y count", () => {
    const { container } = render(
      <ActivityDivider
        state="plex-sync"
        value={3}
        max={8}
        label="Syncing all playlists to Plex"
        labelShort="Syncing to Plex"
        announcements={announcements}
      />
    );
    const rail = container.querySelector(".activity-rail");
    expect(rail).toHaveClass("activity-rail-plex");
    expect(screen.getAllByText("Syncing all playlists to Plex").length).toBeGreaterThan(0);
    expect(screen.getAllByText("3/8").length).toBeGreaterThan(0);
    expect(container.querySelector(".activity-rail-travel")).toBeInTheDocument();
  });

  it("announces the start of a plex sync in the live region", () => {
    render(
      <ActivityDivider
        state="plex-sync"
        value={0}
        max={8}
        label="Syncing all playlists to Plex"
        announcements={announcements}
      />
    );
    expect(screen.getByRole("status")).toHaveTextContent("Started syncing");
  });

  it("substitutes a static determinate fill under reduced motion", () => {
    reducedMotion.value = true;
    const { container } = render(
      <ActivityDivider
        state="plex-sync"
        value={4}
        max={8}
        label="Syncing all playlists to Plex"
        announcements={announcements}
      />
    );
    expect(container.querySelector(".activity-rail-travel")).not.toBeInTheDocument();
    const fill = container.querySelector(".activity-rail-static");
    expect(fill).toBeInTheDocument();
    expect(fill).toHaveStyle({ "inline-size": "50%" });
  });
});
