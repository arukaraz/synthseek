import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@test/test-utils";

import { DiscoveryMixesEmpty } from "../DiscoveryMixesEmpty";
import { DISCOVERY_SETTINGS_HREF } from "../constants";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

describe("DiscoveryMixesEmpty", () => {
  it("renders the error copy without a settings call to action", () => {
    render(<DiscoveryMixesEmpty reason="error" />);

    expect(screen.getByText("Couldn't load your discovery mixes.")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders the disabled copy with an open-settings link to the listenbrainz anchor", () => {
    render(<DiscoveryMixesEmpty reason="disabled" />);

    expect(screen.getByText("Enable ListenBrainz to see your weekly mixes here.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open settings" })).toHaveAttribute("href", DISCOVERY_SETTINGS_HREF);
  });

  it("renders the no-username copy with a configure link", () => {
    render(<DiscoveryMixesEmpty reason="no-username" />);

    expect(screen.getByText("Add your ListenBrainz username to start syncing mixes.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Configure ListenBrainz" })).toBeInTheDocument();
  });

  it("renders the no-kinds copy with a choose-playlists link", () => {
    render(<DiscoveryMixesEmpty reason="no-kinds" />);

    expect(screen.getByText("Pick which playlists to fetch in settings.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Choose playlists" })).toBeInTheDocument();
  });

  it("always renders the widget header so the panel reads as Discover Mixes", () => {
    render(<DiscoveryMixesEmpty reason="error" />);

    expect(screen.getByRole("heading", { name: "Discover Mixes" })).toBeInTheDocument();
  });
});
