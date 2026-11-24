import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@test/test-utils";

import { TopTracksEmpty } from "../TopTracksEmpty";
import { PROVIDER_SETTINGS_HREFS } from "../../constants";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

describe("TopTracksEmpty", () => {
  it("renders the error copy without a call to action", () => {
    render(<TopTracksEmpty reason="error" info="Your top tracks" provider="lastfm" />);

    expect(screen.getByText("Couldn't load Last.fm data.")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("says the server has no Last.fm set up, without a call to action, when the provider is inactive", () => {
    render(<TopTracksEmpty reason="inactive" info="Your top tracks" provider="lastfm" />);

    expect(screen.getByText("Last.fm is not set up on this server.")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("asks an unlinked member for the username with a configure link to the Last.fm settings", () => {
    render(<TopTracksEmpty reason="unlinked" info="Your top tracks" provider="lastfm" />);

    expect(screen.getByText("Add your Last.fm username to see your top tracks here.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Configure Last.fm" })).toHaveAttribute(
      "href",
      PROVIDER_SETTINGS_HREFS.lastfm
    );
  });

  it("names ListenBrainz and links to its settings when the widget is the ListenBrainz one", () => {
    render(<TopTracksEmpty reason="unlinked" info="Your top tracks" provider="listenbrainz" />);

    expect(screen.getByText("Add your ListenBrainz username to see your top tracks here.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Configure ListenBrainz" })).toHaveAttribute(
      "href",
      PROVIDER_SETTINGS_HREFS.listenbrainz
    );
    expect(screen.getByText("Most played · all time · ListenBrainz")).toBeInTheDocument();
  });

  it("renders the no-data copy without a call to action", () => {
    render(<TopTracksEmpty reason="no-data" info="Your top tracks" provider="lastfm" />);

    expect(screen.getByText("No top tracks yet, play some music to see them ranked.")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("always renders the widget header so the panel reads as Top Tracks", () => {
    render(<TopTracksEmpty reason="error" info="Your top tracks" provider="lastfm" />);

    expect(screen.getByRole("heading", { name: "Top Tracks" })).toBeInTheDocument();
  });
});
