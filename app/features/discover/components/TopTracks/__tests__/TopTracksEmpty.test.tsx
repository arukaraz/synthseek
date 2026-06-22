import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@test/test-utils";

import { TopTracksEmpty } from "../TopTracksEmpty";
import { SETTINGS_HREF } from "../constants";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

describe("TopTracksEmpty", () => {
  it("renders the error copy without a call to action", () => {
    render(<TopTracksEmpty reason="error" />);

    expect(screen.getByText("Couldn't load Last.fm data.")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders the disabled copy with an open-settings link to the lastfm anchor", () => {
    render(<TopTracksEmpty reason="disabled" />);

    expect(screen.getByText("Enable Last.fm to see your most played tracks here.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open settings" })).toHaveAttribute("href", SETTINGS_HREF);
  });

  it("renders the no-username copy with a configure link", () => {
    render(<TopTracksEmpty reason="no-username" />);

    expect(screen.getByText("Add your Last.fm username to start syncing top tracks.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Configure Last.fm" })).toBeInTheDocument();
  });

  it("renders the no-data copy without a call to action", () => {
    render(<TopTracksEmpty reason="no-data" />);

    expect(screen.getByText("No top tracks yet, scrobble some music to see them ranked.")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("always renders the widget header so the panel reads as Top Tracks", () => {
    render(<TopTracksEmpty reason="error" />);

    expect(screen.getByRole("heading", { name: "Top Tracks" })).toBeInTheDocument();
  });
});
