import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { createErrorQuery, createLoadingQuery, createMockQuery, type MockQueryResult } from "@test/mocks/trpc.mock";

interface SettingsData {
  connections: {
    plex: { url: string; token: string };
    navidrome: { url: string; username: string; password: string; playback: boolean };
    jellyfin: { url: string; apiKey: string; playback: boolean };
  };
  engine: { plexBehavior: { playback: boolean }; playbackSources: { order: string[] } };
}

let settingsQuery: MockQueryResult<SettingsData | undefined> = createMockQuery<SettingsData | undefined>(undefined);
const orderCard = vi.fn();

vi.mock("@hooks/api/queries/useSettings", () => ({
  useSettings: () => settingsQuery,
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

  it("tells the order card which servers can play right now", () => {
    settingsQuery = createMockQuery<SettingsData | undefined>({
      connections: {
        plex: { url: "http://plex:32400", token: "t" },
        navidrome: { url: "http://navidrome:4533", username: "a", password: "p", playback: true },
        jellyfin: { url: "", apiKey: "", playback: true },
      },
      engine: { plexBehavior: { playback: false }, playbackSources: { order: ["navidrome", "plex", "jellyfin"] } },
    });
    render(<MediaServersSection />);

    expect(screen.getByTestId("navidrome-card")).toBeInTheDocument();
    expect(screen.getByTestId("jellyfin-card")).toBeInTheDocument();
    expect(orderCard).toHaveBeenCalledWith({
      order: ["navidrome", "plex", "jellyfin"],
      playing: { plex: false, navidrome: true, jellyfin: false },
    });
  });
});
