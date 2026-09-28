import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { createErrorQuery, createLoadingQuery, createMockQuery, type MockQueryResult } from "@test/mocks/trpc.mock";

interface SettingsData {
  connections: {
    plex: { url: string; token: string };
    navidrome: { url: string; username: string; password: string };
    jellyfin: { url: string; apiKey: string };
  };
  engine: { plexBehavior: { libraryScan: boolean; playlistSync: boolean }; playbackSources: { order: string[] } };
  formatting: { plexPlaylistUsernameAffix: string; plexPlaylistUsernameSeparator: string };
}

let settingsQuery: MockQueryResult<SettingsData | undefined> = createMockQuery<SettingsData | undefined>(undefined);
const orderCard = vi.fn();
const plexCard = vi.fn();

vi.mock("@hooks/api/queries/useSettings", () => ({
  useSettings: () => settingsQuery,
}));
vi.mock("../PlexIntegrationCard", () => ({
  PlexIntegrationCard: (props: unknown) => {
    plexCard(props);
    return <div data-testid="plex-card" />;
  },
}));
vi.mock("../NavidromeCard", () => ({ NavidromeCard: () => <div data-testid="navidrome-card" /> }));
vi.mock("../JellyfinCard", () => ({ JellyfinCard: () => <div data-testid="jellyfin-card" /> }));
vi.mock("../PlaybackOrderCard", () => ({
  PlaybackOrderCard: (props: unknown) => {
    orderCard(props);
    return <div data-testid="order-card" />;
  },
}));

import { MediaServersSection } from "../MediaServersSection";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("MediaServersSection", () => {
  it("renders the loading and error states", () => {
    settingsQuery = createLoadingQuery<SettingsData | undefined>();
    render(<MediaServersSection />);
    expect(screen.getByText(enSettings.common.loading)).toBeInTheDocument();
    cleanup();

    settingsQuery = createErrorQuery<SettingsData | undefined>(new Error("boom"));
    render(<MediaServersSection />);
    expect(screen.getByText(enSettings.common.loadFailed)).toBeInTheDocument();
  });

  it("holds the Plex card next to the other servers and tells the order card which of them are connected", () => {
    const plexBehavior = { libraryScan: true, playlistSync: false };
    const formatting = { plexPlaylistUsernameAffix: "suffix", plexPlaylistUsernameSeparator: " - " };
    settingsQuery = createMockQuery<SettingsData | undefined>({
      connections: {
        plex: { url: "http://plex:32400", token: "t" },
        navidrome: { url: "http://navidrome:4533", username: "a", password: "" },
        jellyfin: { url: "http://jellyfin:8096", apiKey: "k" },
      },
      engine: { plexBehavior, playbackSources: { order: ["navidrome", "plex", "jellyfin"] } },
      formatting,
    });
    render(<MediaServersSection />);

    expect(screen.getByTestId("plex-card")).toBeInTheDocument();
    expect(screen.getByTestId("navidrome-card")).toBeInTheDocument();
    expect(screen.getByTestId("jellyfin-card")).toBeInTheDocument();
    expect(plexCard).toHaveBeenCalledWith({
      initial: { connection: { url: "http://plex:32400", token: "t" }, behavior: plexBehavior, naming: formatting },
    });
    expect(orderCard).toHaveBeenCalledWith({
      order: ["navidrome", "plex", "jellyfin"],
      connected: { plex: true, navidrome: false, jellyfin: true },
    });
  });
});
