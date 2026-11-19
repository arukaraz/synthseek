import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockQuery, createLoadingQuery, createErrorQuery, type MockQueryResult } from "@test/mocks/trpc.mock";

interface SettingsData {
  connections: {
    spotify: { enabled: boolean };
    enrichment: unknown;
    plex: { url: string; token: string };
    navidrome: { url: string; username: string; password: string };
    jellyfin: { url: string; apiKey: string };
  };
  library: { syncIntervalMinutes: number };
}

let settingsQuery: MockQueryResult<SettingsData | undefined> = createMockQuery<SettingsData | undefined>(undefined);

const cards = vi.hoisted(() => ({ spotify: vi.fn(), mediaServers: vi.fn(), sync: vi.fn() }));

vi.mock("@hooks/api/queries/useSettings", () => ({
  useSettings: () => settingsQuery,
}));

vi.mock("../SpotifySourceCard", () => ({
  SpotifySourceCard: (props: { spotify: unknown }) => {
    cards.spotify(props);
    return <div data-testid="spotify-source-card" />;
  },
}));

vi.mock("../MediaServersSection", () => ({
  MediaServersSection: (props: { settings: unknown }) => {
    cards.mediaServers(props);
    return <div data-testid="playback-order" />;
  },
}));

vi.mock("../LibrarySyncCard", () => ({
  LibrarySyncCard: (props: { initial: unknown }) => {
    cards.sync(props);
    return <div data-testid="library-sync-card" />;
  },
}));

import { LibrarySourcesSection } from "../LibrarySourcesSection";

const data: SettingsData = {
  connections: {
    spotify: { enabled: true },
    enrichment: {},
    plex: { url: "http://plex.local:32400", token: "plex-token" },
    navidrome: { url: "http://navidrome.local", username: "me", password: "" },
    jellyfin: { url: "", apiKey: "jf-key" },
  },
  library: { syncIntervalMinutes: 45 },
};

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  settingsQuery = createMockQuery<SettingsData | undefined>(undefined);
});

describe("LibrarySourcesSection", () => {
  it("renders the loading state", () => {
    settingsQuery = createLoadingQuery<SettingsData | undefined>();
    render(<LibrarySourcesSection />);
    expect(screen.getByText(enSettings.common.loading)).toBeInTheDocument();
    expect(screen.queryByTestId("spotify-source-card")).not.toBeInTheDocument();
  });

  it("renders the error state with the failure reason", () => {
    settingsQuery = createErrorQuery<SettingsData | undefined>(new Error("boom"));
    render(<LibrarySourcesSection />);
    expect(screen.getByText(/boom/)).toBeInTheDocument();
    expect(screen.queryByTestId("spotify-source-card")).not.toBeInTheDocument();
  });

  it("puts the playback order first, across the full width, and the Spotify and sync cards under it", () => {
    settingsQuery = createMockQuery<SettingsData | undefined>(data);
    render(<LibrarySourcesSection />);
    const order = screen.getByTestId("playback-order");
    const spotify = screen.getByTestId("spotify-source-card");
    const sync = screen.getByTestId("library-sync-card");
    expect(order.compareDocumentPosition(spotify) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(spotify.compareDocumentPosition(sync) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(spotify.parentElement).toBe(sync.parentElement);
    expect(order.parentElement).not.toBe(spotify.parentElement);
  });

  it("no longer lists the media servers as a card of links", () => {
    settingsQuery = createMockQuery<SettingsData | undefined>(data);
    render(<LibrarySourcesSection />);
    expect(screen.queryByText("Your media servers")).toBeNull();
  });

  it("hands each card the slice of the settings it edits", () => {
    settingsQuery = createMockQuery<SettingsData | undefined>(data);
    render(<LibrarySourcesSection />);
    expect(cards.spotify).toHaveBeenCalledWith({ spotify: data.connections.spotify });
    expect(cards.sync).toHaveBeenCalledWith({ initial: { syncIntervalMinutes: 45 } });
  });

  it("hands the playback order the settings it reads", () => {
    settingsQuery = createMockQuery<SettingsData | undefined>(data);
    render(<LibrarySourcesSection />);
    expect(cards.mediaServers).toHaveBeenCalledWith({ settings: data });
  });
});
