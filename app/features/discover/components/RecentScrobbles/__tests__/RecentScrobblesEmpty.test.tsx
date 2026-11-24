import { describe, expect, it } from "vitest";

import { render, screen } from "@test/test-utils";

import { PROVIDER_SETTINGS_HREFS } from "../../constants";
import { RecentScrobblesEmpty } from "../RecentScrobblesEmpty";

describe("RecentScrobblesEmpty", () => {
  it("renders the error reason without a call to action", () => {
    render(<RecentScrobblesEmpty reason="error" info="Your latest scrobbles" provider="lastfm" />);

    expect(screen.getByText("Couldn't load Last.fm data.")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("says the server has no Last.fm set up, without a call to action, when the provider is inactive", () => {
    render(<RecentScrobblesEmpty reason="inactive" info="Your latest scrobbles" provider="lastfm" />);

    expect(screen.getByText("Last.fm is not set up on this server.")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("asks an unlinked member for the username with a configure link", () => {
    render(<RecentScrobblesEmpty reason="unlinked" info="Your latest scrobbles" provider="lastfm" />);

    expect(screen.getByText("Add your Last.fm username to see your recent plays here.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Configure Last.fm" })).toHaveAttribute(
      "href",
      PROVIDER_SETTINGS_HREFS.lastfm
    );
  });

  it("titles the ListenBrainz widget Recent Listens and links to the ListenBrainz settings", () => {
    render(<RecentScrobblesEmpty reason="unlinked" info="Your latest listens" provider="listenbrainz" />);

    expect(screen.getByRole("heading", { name: "Recent Listens" })).toBeInTheDocument();
    expect(screen.getByText("Add your ListenBrainz username to see your recent plays here.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Configure ListenBrainz" })).toHaveAttribute(
      "href",
      PROVIDER_SETTINGS_HREFS.listenbrainz
    );
  });

  it("renders the no-data reason without a call to action", () => {
    render(<RecentScrobblesEmpty reason="no-data" info="Your latest scrobbles" provider="lastfm" />);

    expect(screen.getByText("Nothing played yet, your timeline will appear here.")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
