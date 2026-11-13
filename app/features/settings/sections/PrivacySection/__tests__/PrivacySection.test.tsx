import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";
import { createMockUser } from "@test/mocks/feature-hooks.mock";

import type { PublicUser } from "@api/__generated__/types";

import type { ListeningConnectionView, PrivacyOverview, SourceAccountView } from "../types";

const copy = enSettings.privacy;

interface PrivacyTestState {
  user: PublicUser | null;
  admin: boolean;
  overview: PrivacyOverview | undefined;
  connections: ListeningConnectionView[];
  accounts: SourceAccountView[];
  updateProfile: ReturnType<typeof vi.fn>;
  setChannel: ReturnType<typeof vi.fn>;
  setMinutes: ReturnType<typeof vi.fn>;
  clearHistory: ReturnType<typeof vi.fn>;
}

const state = vi.hoisted<PrivacyTestState>(() => ({
  user: null,
  admin: false,
  overview: undefined,
  connections: [],
  accounts: [],
  updateProfile: vi.fn(),
  setChannel: vi.fn(),
  setMinutes: vi.fn(),
  clearHistory: vi.fn(),
}));

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ currentUser: state.user, isAdmin: state.admin, isLoading: false }),
}));

vi.mock("@hooks/api/mutations/auth/useUpdateProfile", () => ({
  useUpdateProfile: () => ({ mutate: state.updateProfile, isPending: false }),
}));

vi.mock("@hooks/api", () => ({
  usePrivacyOverview: () => ({ data: state.overview }),
  useSetPlayChannel: () => ({ mutate: state.setChannel, isPending: false }),
  useSetPrivateSessionMinutes: () => ({ mutate: state.setMinutes, isPending: false }),
  useClearListeningHistory: () => ({ mutate: state.clearHistory, isPending: false }),
  useListeningConnections: () => ({ data: state.connections }),
  usePlaybackSourceAccounts: () => ({ data: state.accounts }),
}));

import { PrivacySection } from "../PrivacySection";

function overview(overrides: Partial<PrivacyOverview["server"]> = {}): PrivacyOverview {
  return {
    server: { membersSeeRequests: true, defaultPlaylistVisibility: "shared", nowPlayingEnabled: true, ...overrides },
    history: { hour: 1, day: 4, week: 9, all: 120 },
    sessionMinutes: { min: 1, max: 1440, customStart: 360 },
  };
}

function card(title: string): HTMLElement {
  const section = screen.getByRole("heading", { name: new RegExp(`^${title}`) }).closest("section");
  if (section === null) throw new Error(`no card titled ${title}`);
  return section;
}

function row(anchor: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-anchor-target="${anchor}"]`);
  if (element === null) throw new Error(`no row anchored at ${anchor}`);
  return element;
}

async function explanationOf(anchor: string): Promise<HTMLElement> {
  await userEvent.hover(within(row(anchor)).getByRole("button", { name: "More information" }));
  return screen.findByRole("tooltip");
}

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

beforeEach(() => {
  vi.clearAllMocks();
  state.user = createMockUser();
  state.admin = false;
  state.overview = overview();
  state.connections = [];
  state.accounts = [];
});

afterEach(cleanup);

describe("PrivacySection", () => {
  it("renders nothing without a signed-in member", () => {
    state.user = null;

    const { container } = render(<PrivacySection />);

    expect(container).toBeEmptyDOMElement();
  });

  it("holds every choice in one untitled card: channels first, clearing the history last", () => {
    render(<PrivacySection />);

    const privacy = screen.getByRole("region", { name: enSettings.shell.pages.privacy.title });
    const anchors = Array.from(privacy.querySelectorAll<HTMLElement>("[data-anchor-target]")).map(
      (element) => element.dataset.anchorTarget
    );
    expect(anchors).toEqual([
      "privacy.channels.history",
      "privacy.channels.scrobble",
      "privacy.channels.mediaServer",
      "privacy.channels.nowPlaying",
      "privacy.sessionLength",
      "household",
      "privacy.playlists",
      "privacy.requests",
      "privacy.clear",
    ]);
    expect(screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent)).toEqual([
      copy.leaving.title,
    ]);
  });

  it("offers no private session switch here, which lives in the player", () => {
    render(<PrivacySection />);

    expect(screen.queryByRole("switch", { name: /^Private session$/ })).not.toBeInTheDocument();
  });

  it("keeps the server's settings off this page, for an administrator too", () => {
    state.admin = true;

    render(<PrivacySection />);

    expect(screen.queryByRole("switch", { name: copy.server.requests.label })).not.toBeInTheDocument();
    expect(screen.queryByRole("switch", { name: copy.server.nowPlaying.label })).not.toBeInTheDocument();
  });

  it("explains each row from its info button rather than under its label", async () => {
    render(<PrivacySection />);

    expect(screen.queryByText(copy.playlists.description)).not.toBeInTheDocument();
    expect(await explanationOf("privacy.playlists")).toHaveTextContent(copy.playlists.description);
  });
});

describe("Household row", () => {
  it("saves the sharing switch on the account", async () => {
    render(<PrivacySection />);

    await userEvent.click(screen.getByRole("switch", { name: copy.household.label }));

    expect(state.updateProfile).toHaveBeenCalledWith({ shareListening: true });
  });

  it("explains what the switch reaches, which is no longer Now playing", async () => {
    render(<PrivacySection />);

    const explanation = await explanationOf("household");

    expect(explanation).toHaveTextContent(copy.household.description);
    expect(explanation).not.toHaveTextContent(copy.channels.nowPlayingOff);
  });
});

function channelSwitch(channel: keyof typeof channelLabels, scope: "default" | "private"): HTMLElement {
  return screen.getByRole("switch", {
    name: copy.channels.switch
      .replace("{{channel}}", channelLabels[channel])
      .replace("{{scope}}", copy.channels[scope]),
  });
}

const channelLabels = {
  history: copy.channels.history.label,
  scrobble: copy.channels.scrobble.label,
  mediaServer: copy.channels.mediaServer.label,
  nowPlaying: copy.channels.nowPlaying.label,
};

describe("Play channels table", () => {
  it("draws a Default and a Private session switch for each of the four channels", () => {
    render(<PrivacySection />);

    expect(screen.getAllByRole("columnheader").map((header) => header.textContent)).toEqual([
      copy.channels.default,
      copy.channels.private,
    ]);
    expect(within(screen.getByRole("table")).getAllByRole("switch")).toHaveLength(8);
    expect(channelSwitch("history", "default")).toBeChecked();
    expect(channelSwitch("history", "private")).not.toBeChecked();
    expect(channelSwitch("nowPlaying", "default")).not.toBeChecked();
  });

  it("saves the switch that was pressed, naming its channel and its column", async () => {
    render(<PrivacySection />);

    await userEvent.click(channelSwitch("scrobble", "private"));
    expect(state.setChannel).toHaveBeenLastCalledWith({ channel: "scrobble", scope: "private", enabled: true });

    await userEvent.click(channelSwitch("mediaServer", "default"));
    expect(state.setChannel).toHaveBeenLastCalledWith({ channel: "mediaServer", scope: "default", enabled: false });
  });

  it("locks the private switch of a channel that is off by default, and shows it off whatever was saved", () => {
    const user = createMockUser();
    state.user = { ...user, playChannels: { ...user.playChannels, scrobble: { default: false, private: true } } };

    render(<PrivacySection />);

    expect(channelSwitch("scrobble", "private")).toBeDisabled();
    expect(channelSwitch("scrobble", "private")).not.toBeChecked();
    expect(channelSwitch("history", "private")).toBeEnabled();
  });

  it("shows a private switch as on once its channel keeps running in a private session", () => {
    const user = createMockUser();
    state.user = { ...user, playChannels: { ...user.playChannels, history: { default: true, private: true } } };

    render(<PrivacySection />);

    expect(channelSwitch("history", "private")).toBeChecked();
  });

  it("leaves the server note out of Now playing while the server allows it", async () => {
    render(<PrivacySection />);

    const explanation = await explanationOf("privacy.channels.nowPlaying");

    expect(explanation).toHaveTextContent(copy.channels.nowPlaying.description);
    expect(explanation).not.toHaveTextContent(copy.channels.nowPlayingOff);
  });

  it("says so on Now playing when the server has turned it off", async () => {
    state.overview = overview({ nowPlayingEnabled: false });

    render(<PrivacySection />);

    expect(await explanationOf("privacy.channels.nowPlaying")).toHaveTextContent(copy.channels.nowPlayingOff);
  });
});

describe("Private session length row", () => {
  const lengthMenu = () => screen.getByRole("button", { name: copy.sessionLength.label });

  it("shows the saved length as its preset", () => {
    state.user = createMockUser({ privateSessionMinutes: 120 });

    render(<PrivacySection />);

    expect(lengthMenu()).toHaveTextContent(copy.sessionLength.options["120"]);
    expect(screen.queryByRole("spinbutton", { name: copy.sessionLength.custom })).not.toBeInTheDocument();
  });

  it("saves a preset in minutes", async () => {
    render(<PrivacySection />);

    await userEvent.click(lengthMenu());
    await userEvent.click(await screen.findByRole("menuitemradio", { name: copy.sessionLength.options["30"] }));

    expect(state.setMinutes).toHaveBeenCalledWith({ minutes: 30 });
  });

  it("saves no end at all for a session that lasts until it is turned off, and shows it", async () => {
    render(<PrivacySection />);

    await userEvent.click(lengthMenu());
    await userEvent.click(await screen.findByRole("menuitemradio", { name: copy.sessionLength.options.open }));
    expect(state.setMinutes).toHaveBeenCalledWith({ minutes: null });

    cleanup();
    state.user = createMockUser({ privateSessionMinutes: null });
    render(<PrivacySection />);
    expect(lengthMenu()).toHaveTextContent(copy.sessionLength.options.open);
  });

  it("shows a length that is no preset as Custom, with its minutes", () => {
    state.user = createMockUser({ privateSessionMinutes: 45 });

    render(<PrivacySection />);

    expect(lengthMenu()).toHaveTextContent(copy.sessionLength.options.custom);
    expect(screen.getByLabelText(copy.sessionLength.custom)).toHaveValue(45);
  });

  it("opens the minutes field on Custom without saving while a preset length stands", async () => {
    render(<PrivacySection />);

    await userEvent.click(lengthMenu());
    await userEvent.click(await screen.findByRole("menuitemradio", { name: copy.sessionLength.options.custom }));

    expect(state.setMinutes).not.toHaveBeenCalled();
    expect(screen.getByLabelText(copy.sessionLength.custom)).toHaveValue(360);
  });

  it("gives Custom a length to start from when the session had no end", async () => {
    state.user = createMockUser({ privateSessionMinutes: null });
    render(<PrivacySection />);

    await userEvent.click(lengthMenu());
    await userEvent.click(await screen.findByRole("menuitemradio", { name: copy.sessionLength.options.custom }));

    expect(state.setMinutes).toHaveBeenCalledWith({ minutes: 360 });
  });

  it("takes the starting length and the bounds from the server, not from a copy of them", async () => {
    state.user = createMockUser({ privateSessionMinutes: null });
    state.overview = { ...overview(), sessionMinutes: { min: 5, max: 90, customStart: 45 } };
    const view = render(<PrivacySection />);

    await userEvent.click(lengthMenu());
    await userEvent.click(await screen.findByRole("menuitemradio", { name: copy.sessionLength.options.custom }));
    expect(state.setMinutes).toHaveBeenCalledWith({ minutes: 45 });

    state.user = createMockUser({ privateSessionMinutes: 45 });
    view.rerender(<PrivacySection />);
    const field = screen.getByLabelText(copy.sessionLength.custom);
    expect(field).toHaveAttribute("min", "5");
    expect(field).toHaveAttribute("max", "90");
  });

  it("waits for the server's bounds before letting the length change", () => {
    state.overview = undefined;
    render(<PrivacySection />);

    expect(lengthMenu()).toBeDisabled();
  });
});

describe("Playlists row", () => {
  it("shows the server default until the member picks", () => {
    state.overview = overview({ defaultPlaylistVisibility: "private" });

    render(<PrivacySection />);

    expect(screen.getByRole("radio", { name: copy.playlists.private })).toBeChecked();
  });

  it("saves the member's own choice", async () => {
    render(<PrivacySection />);

    await userEvent.click(screen.getByRole("radio", { name: copy.playlists.private }));

    expect(state.updateProfile).toHaveBeenCalledWith({ playlistVisibility: "private" });
  });

  it("shows the member's own choice over the server default", () => {
    state.user = createMockUser({ playlistVisibility: "private" });

    render(<PrivacySection />);

    expect(screen.getByRole("radio", { name: copy.playlists.private })).toBeChecked();
  });
});

describe("Requests row", () => {
  it("saves whether the member's name shows on their requests", async () => {
    render(<PrivacySection />);

    await userEvent.click(screen.getByRole("switch", { name: copy.requests.label }));

    expect(state.updateProfile).toHaveBeenCalledWith({ showRequestName: false });
  });

  it("locks the switch and says why when members only see their own requests", async () => {
    state.overview = overview({ membersSeeRequests: false });

    render(<PrivacySection />);

    expect(screen.getByRole("switch", { name: copy.requests.label })).toBeDisabled();
    expect(await explanationOf("privacy.requests")).toHaveTextContent(copy.requests.locked);
  });
});

describe("Clear listening history row", () => {
  it("clears the range the member picked, showing how many plays each range holds", async () => {
    render(<PrivacySection />);

    await userEvent.click(screen.getByRole("button", { name: copy.history.clear.open }));
    const week = screen.getByRole("radio", { name: new RegExp(copy.history.clear.ranges.week) });
    expect(week).toHaveTextContent("9 plays");
    expect(screen.getByRole("radio", { name: new RegExp(copy.history.clear.ranges.hour) })).toHaveTextContent("1 play");
    await userEvent.click(week);
    await userEvent.click(screen.getByRole("button", { name: copy.history.clear.confirm }));

    expect(state.clearHistory).toHaveBeenCalledWith({ range: "week" });
  });

  it("clears the last hour when the member confirms without picking", async () => {
    render(<PrivacySection />);

    await userEvent.click(screen.getByRole("button", { name: copy.history.clear.open }));
    await userEvent.click(screen.getByRole("button", { name: copy.history.clear.confirm }));

    expect(state.clearHistory).toHaveBeenCalledWith({ range: "hour" });
  });

  it("keeps the clear button off until the play counts have loaded", () => {
    state.overview = undefined;

    render(<PrivacySection />);

    expect(screen.getByRole("button", { name: copy.history.clear.open })).toBeDisabled();
  });
});

describe("What leaves this server card", () => {
  it("lists each service with where it stands and links to Connections", () => {
    const connection = { configured: true, externalUsername: null, relayedClients: [], lastFailure: null };
    state.connections = [
      { ...connection, service: "lastfm", connected: true, scrobbleEnabled: true },
      { ...connection, service: "listenbrainz", connected: false, scrobbleEnabled: false },
    ];
    state.accounts = [
      {
        server: "plex",
        linkMethod: "plex",
        connected: true,
        externalUsername: null,
        reportEnabled: false,
        lastFailure: null,
      },
      {
        server: "jellyfin",
        linkMethod: "password",
        connected: true,
        externalUsername: null,
        reportEnabled: true,
        lastFailure: null,
      },
    ];

    render(<PrivacySection />);

    const leaving = within(card(copy.leaving.title));
    const rows = leaving.getAllByRole("listitem").map((row) => row.textContent);
    expect(rows).toEqual([
      `${copy.leaving.lastfm}${copy.leaving.on}`,
      `${copy.leaving.listenbrainz}${copy.leaving.notConnected}`,
      `${copy.leaving.server.replace("{{server}}", "Plex")}${copy.leaving.off}`,
      `${copy.leaving.server.replace("{{server}}", "Jellyfin")}${copy.leaving.on}`,
    ]);
    expect(leaving.getByRole("link", { name: copy.leaving.manage })).toHaveAttribute(
      "href",
      "/settings/connections/services"
    );
  });
});
