import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockSettings } from "@test/mocks/feature-hooks.mock";
import {
  createErrorQuery,
  createLoadingQuery,
  createMockMutation,
  createMockQuery,
  type MockQueryResult,
} from "@test/mocks/trpc.mock";
import { PLAYBACK_SERVER_NAMES, type PlaybackServerKey } from "@utils/playback-servers";

type Settings = ReturnType<typeof createMockSettings>;
type ChainKey = "local" | PlaybackServerKey;

const navigation = vi.hoisted(() => ({ search: "", replace: vi.fn() }));
const plexCard = vi.hoisted(() => vi.fn());

let settingsQuery: MockQueryResult<Settings | undefined> = createMockQuery<Settings | undefined>(undefined);
const updateOrder = createMockMutation();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: navigation.replace, push: vi.fn() }),
  usePathname: () => "/settings/media",
  useSearchParams: () => new URLSearchParams(navigation.search),
}));

vi.mock("@hooks/api/queries/useSettings", () => ({ useSettings: () => settingsQuery }));
vi.mock("@hooks/api/mutations/settings/useUpdateEngine", () => ({
  useUpdateEnginePlaybackSources: () => updateOrder,
}));

vi.mock("../LocalPlaybackCard", () => ({ LocalPlaybackCard: () => <div data-testid="local-card" /> }));
vi.mock("../PlexIntegrationCard", () => ({
  PlexIntegrationCard: (props: unknown) => {
    plexCard(props);
    return <div data-testid="plex-card" />;
  },
}));
const reveal = vi.hoisted(() => vi.fn());

vi.mock("../../../hooks/useRevealPanel", () => ({
  useRevealPanel: () => ({ panelRef: { current: null }, reveal }),
}));

vi.mock("../NavidromeCard", () => ({ NavidromeCard: () => <div data-testid="navidrome-card" /> }));
vi.mock("../JellyfinCard", () => ({ JellyfinCard: () => <div data-testid="jellyfin-card" /> }));

import { MediaServersSection } from "../MediaServersSection";

const CARDS = ["local-card", "plex-card", "navidrome-card", "jellyfin-card"];

const TITLES: Record<ChainKey, string> = { local: enSettings.mediaServers.order.local, ...PLAYBACK_SERVER_NAMES };

const base = createMockSettings();
const plexBehavior = { libraryScan: true, playlistSync: false };

const settings: Settings = {
  ...base,
  connections: {
    ...base.connections,
    plex: { url: "http://plex:32400", token: "t" },
    navidrome: { url: "http://navidrome:4533", username: "a", password: "", playlistSync: false },
    jellyfin: { url: "http://jellyfin:8096", apiKey: "k", playlistSync: false },
  },
  engine: { ...base.engine, plexBehavior, playbackSources: { order: ["navidrome", "plex", "jellyfin"] } },
  formatting: { plexPlaylistUsernameAffix: "suffix", plexPlaylistUsernameSeparator: " - " },
};

const openName = (key: ChainKey) => i18n.t("settings:shell.chain.open", { name: TITLES[key] });
const moveUp = (key: ChainKey) => i18n.t("settings:shell.chain.moveUp", { name: TITLES[key] });
const moveDown = (key: ChainKey) => i18n.t("settings:shell.chain.moveDown", { name: TITLES[key] });

function chainOrder(): ChainKey[] {
  const keys: ChainKey[] = ["local", "plex", "navidrome", "jellyfin"];
  return screen
    .getAllByRole("button")
    .map((button) => keys.find((key) => button.getAttribute("aria-label") === openName(key)))
    .filter((key) => key !== undefined);
}

function chainItem(key: ChainKey): HTMLElement {
  const item = screen.getByRole("button", { name: openName(key) }).closest("li");
  if (item === null) throw new Error(`no chain item for ${key}`);
  return item;
}

function visibleCards(): string[] {
  return CARDS.filter((card) => screen.getByTestId(card).closest("[hidden]") === null);
}

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

beforeEach(() => {
  navigation.search = "";
  settingsQuery = createMockQuery<Settings | undefined>(settings);
  updateOrder.mutateAsync.mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("MediaServersSection", () => {
  it("renders the loading and error states", () => {
    settingsQuery = createLoadingQuery<Settings | undefined>();
    render(<MediaServersSection />);
    expect(screen.getByText(enSettings.common.loading)).toBeInTheDocument();
    cleanup();

    settingsQuery = createErrorQuery<Settings | undefined>(new Error("boom"));
    render(<MediaServersSection />);
    expect(screen.getByText(enSettings.common.loadFailed)).toBeInTheDocument();
  });

  it("puts Local first and the servers after it in their saved order", () => {
    render(<MediaServersSection />);

    expect(chainOrder()).toEqual(["local", "navidrome", "plex", "jellyfin"]);
  });

  it("gives Local no way to move, and the first server no way to climb above it", () => {
    render(<MediaServersSection />);

    expect(screen.queryByRole("button", { name: moveUp("local") })).toBeNull();
    expect(screen.queryByRole("button", { name: moveDown("local") })).toBeNull();
    expect(screen.getByRole("button", { name: moveUp("navidrome") })).toBeDisabled();
  });

  it("tells each server apart by whether its connection is complete", () => {
    render(<MediaServersSection />);

    expect(within(chainItem("plex")).getByText(enSettings.mediaServers.order.connected)).toBeInTheDocument();
    expect(within(chainItem("navidrome")).getByText(enSettings.mediaServers.order.notConnected)).toBeInTheDocument();
    expect(within(chainItem("jellyfin")).getByText(enSettings.mediaServers.order.connected)).toBeInTheDocument();
  });

  it("shows the Local card first, with every server card mounted behind it", () => {
    render(<MediaServersSection />);

    for (const card of CARDS) expect(screen.getByTestId(card)).toBeInTheDocument();
    expect(visibleCards()).toEqual(["local-card"]);
  });

  it("shows the server the URL names", () => {
    navigation.search = "server=jellyfin";
    render(<MediaServersSection />);

    expect(visibleCards()).toEqual(["jellyfin-card"]);
  });

  it("puts the chosen server in the URL", async () => {
    render(<MediaServersSection />);

    await userEvent.click(screen.getByRole("button", { name: openName("plex") }));

    expect(navigation.replace).toHaveBeenCalledWith("/settings/media?server=plex", { scroll: false });
  });

  it("brings the chosen server's panel into view, Local included", async () => {
    render(<MediaServersSection />);

    await userEvent.click(screen.getByRole("button", { name: openName("navidrome") }));
    expect(reveal).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole("button", { name: openName("local") }));
    expect(reveal).toHaveBeenCalledTimes(2);
  });

  it("hands the Plex card its connection, behaviour and playlist naming", () => {
    render(<MediaServersSection />);

    expect(plexCard).toHaveBeenCalledWith({
      initial: {
        connection: settings.connections.plex,
        behavior: plexBehavior,
        naming: settings.formatting,
      },
    });
  });

  it("saves a moved server as the new order of the servers alone", async () => {
    render(<MediaServersSection />);

    await userEvent.click(screen.getByRole("button", { name: moveUp("plex") }));

    expect(chainOrder()).toEqual(["local", "plex", "navidrome", "jellyfin"]);
    expect(updateOrder.mutateAsync).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    expect(updateOrder.mutateAsync).toHaveBeenCalledWith({ order: ["plex", "navidrome", "jellyfin"] });
    await waitFor(() => expect(screen.queryByRole("button", { name: enSettings.shell.saveBar.save })).toBeNull());
  });

  it("drops the draft once the servers are back in their saved order", async () => {
    render(<MediaServersSection />);

    await userEvent.click(screen.getByRole("button", { name: moveDown("plex") }));
    await userEvent.click(screen.getByRole("button", { name: moveUp("plex") }));

    expect(screen.queryByRole("button", { name: enSettings.shell.saveBar.save })).toBeNull();
  });
});
