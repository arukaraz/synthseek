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
  setSession: ReturnType<typeof vi.fn>;
  clearHistory: ReturnType<typeof vi.fn>;
}

const state = vi.hoisted<PrivacyTestState>(() => ({
  user: null,
  admin: false,
  overview: undefined,
  connections: [],
  accounts: [],
  updateProfile: vi.fn(),
  setSession: vi.fn(),
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
  useSetPrivateSession: () => ({ mutate: state.setSession, isPending: false }),
  useClearListeningHistory: () => ({ mutate: state.clearHistory, isPending: false }),
  useListeningConnections: () => ({ data: state.connections }),
  usePlaybackSourceAccounts: () => ({ data: state.accounts }),
}));

import { PrivacySection } from "../PrivacySection";

function overview(overrides: Partial<PrivacyOverview["server"]> = {}): PrivacyOverview {
  return {
    server: { membersSeeRequests: true, defaultPlaylistVisibility: "shared", nowPlayingEnabled: true, ...overrides },
    history: { hour: 1, day: 4, week: 9, all: 120 },
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

  it("holds every choice in one untitled card, with the listening history under its own heading", () => {
    render(<PrivacySection />);

    const privacy = screen.getByRole("region", { name: enSettings.shell.pages.privacy.title });
    const labels = within(privacy)
      .getAllByText(/./, { selector: "span.text-fg" })
      .map((label) => label.textContent);
    expect(labels).toEqual([
      copy.household.label,
      copy.playlists.label,
      copy.requests.label,
      copy.history.session.label,
      copy.history.clear.label,
    ]);
    expect(screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent)).toEqual([
      copy.history.title,
      copy.leaving.title,
    ]);
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

  it("leaves the now playing note out while the server allows it", async () => {
    render(<PrivacySection />);

    const explanation = await explanationOf("household");

    expect(explanation).toHaveTextContent(copy.household.description);
    expect(explanation).not.toHaveTextContent(copy.household.nowPlayingOff);
  });

  it("says so when the server has turned now playing off", async () => {
    state.overview = overview({ nowPlayingEnabled: false });

    render(<PrivacySection />);

    expect(await explanationOf("household")).toHaveTextContent(copy.household.nowPlayingOff);
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

describe("Listening history rows", () => {
  it("starts a private session", async () => {
    render(<PrivacySection />);

    await userEvent.click(screen.getByRole("switch", { name: copy.history.session.label }));

    expect(state.setSession).toHaveBeenCalledWith({ enabled: true });
  });

  it("shows a running session as on, with when it ends, and ends it", async () => {
    state.user = createMockUser({ privateSessionUntil: new Date(Date.now() + 60 * 60 * 1000) });

    render(<PrivacySection />);

    const toggle = screen.getByRole("switch", { name: copy.history.session.label });
    expect(toggle).toBeChecked();
    expect(screen.getByText(/^On until /)).toBeInTheDocument();
    await userEvent.click(toggle);

    expect(state.setSession).toHaveBeenCalledWith({ enabled: false });
  });

  it("treats a session whose end has passed as off", () => {
    state.user = createMockUser({ privateSessionUntil: new Date(Date.now() - 1000) });

    render(<PrivacySection />);

    expect(screen.getByRole("switch", { name: copy.history.session.label })).not.toBeChecked();
    expect(screen.queryByText(/^On until /)).not.toBeInTheDocument();
  });

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
