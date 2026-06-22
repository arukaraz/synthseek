import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockMutation, createMockQuery, type MockQueryResult } from "@test/mocks/trpc.mock";
import { createMockUser } from "@test/mocks/feature-hooks.mock";

interface SpotifyConfig {
  spotify: { enabled: boolean; configured: boolean };
}
interface SpotifyStatus {
  connected: boolean;
  externalUsername?: string;
}
type AuthUser = ReturnType<typeof createMockUser> | null;

let authUser: AuthUser = createMockUser({ plexLinked: false, hasPassword: true });
let configQuery: MockQueryResult<SpotifyConfig | undefined> = createMockQuery<SpotifyConfig | undefined>({
  spotify: { enabled: false, configured: false },
});
let statusQuery: MockQueryResult<SpotifyStatus | undefined> = createMockQuery<SpotifyStatus | undefined>({
  connected: false,
});

const connect = createMockMutation();
const disconnect = createMockMutation();
const plexUnlink = createMockMutation();
const plexLinkStart = vi.fn();
let plexLinkPending = false;

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ currentUser: authUser, isAdmin: false, isLoading: false }),
}));

vi.mock("@hooks/api/queries/usePublicConfig", () => ({
  usePublicConfig: () => configQuery,
}));

vi.mock("@hooks/api/queries/spotify/useSpotifyConnectionStatus", () => ({
  useSpotifyConnectionStatus: () => statusQuery,
}));

vi.mock("@hooks/api/mutations/spotify/useSpotifyConnect", () => ({
  useSpotifyConnect: () => connect,
  useSpotifyDisconnect: () => disconnect,
}));

vi.mock("@hooks/api/mutations/auth/usePlexUnlink", () => ({
  usePlexUnlink: () => plexUnlink,
}));

vi.mock("../../hooks/usePlexLink", () => ({
  usePlexLink: () => ({ start: plexLinkStart, reset: vi.fn(), phase: "idle", isPending: plexLinkPending }),
}));

vi.mock("@features/spotify-library", () => ({
  SpotifyMark: () => <span data-testid="spotify-mark" />,
}));

import { ConnectedAccountsCard } from "../ConnectedAccountsCard";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  authUser = createMockUser({ plexLinked: false, hasPassword: true });
  configQuery = createMockQuery<SpotifyConfig | undefined>({ spotify: { enabled: false, configured: false } });
  statusQuery = createMockQuery<SpotifyStatus | undefined>({ connected: false });
  plexLinkPending = false;
});

describe("ConnectedAccountsCard", () => {
  it("renders the card title", () => {
    render(<ConnectedAccountsCard />);
    expect(screen.getByText(enSettings.profile.connected.title)).toBeInTheDocument();
  });

  it("shows a connect button for a configured but not connected spotify", async () => {
    configQuery = createMockQuery<SpotifyConfig | undefined>({ spotify: { enabled: true, configured: true } });
    render(<ConnectedAccountsCard />);

    expect(screen.getByText(enSettings.profile.connected.spotify.notConnected)).toBeInTheDocument();
    const connectButton = screen.getAllByRole("button", { name: enSettings.profile.connected.connect })[0];
    expect(connectButton).toBeEnabled();
    await userEvent.click(connectButton);
    expect(connect.mutate).toHaveBeenCalledTimes(1);
  });

  it("disables the spotify connect button when spotify is not configured", () => {
    configQuery = createMockQuery<SpotifyConfig | undefined>({ spotify: { enabled: true, configured: false } });
    render(<ConnectedAccountsCard />);

    expect(screen.getByText(enSettings.profile.connected.spotify.notConfigured)).toBeInTheDocument();
    const connectButton = screen.getAllByRole("button", { name: enSettings.profile.connected.connect })[0];
    expect(connectButton).toBeDisabled();
  });

  it("shows the external username and a disconnect button when spotify is connected", async () => {
    configQuery = createMockQuery<SpotifyConfig | undefined>({ spotify: { enabled: true, configured: true } });
    statusQuery = createMockQuery<SpotifyStatus | undefined>({ connected: true, externalUsername: "spotify-bob" });
    render(<ConnectedAccountsCard />);

    expect(screen.getByText("spotify-bob")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: enSettings.profile.connected.disconnect }));
    expect(disconnect.mutate).toHaveBeenCalledTimes(1);
  });

  it("shows a plex connect button and starts linking when clicked", async () => {
    authUser = createMockUser({ plexLinked: false, hasPassword: true });
    render(<ConnectedAccountsCard />);

    expect(screen.getByText(enSettings.profile.connected.plex.notLinked)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: enSettings.profile.connected.connect }));
    expect(plexLinkStart).toHaveBeenCalledTimes(1);
  });

  it("shows the connecting state while a plex link is pending", () => {
    authUser = createMockUser({ plexLinked: false, hasPassword: true });
    plexLinkPending = true;
    render(<ConnectedAccountsCard />);
    expect(screen.getByText(enSettings.profile.connected.plex.connecting)).toBeInTheDocument();
  });

  it("unlinks plex when linked and the account has a password", async () => {
    authUser = createMockUser({ plexLinked: true, hasPassword: true, plex_username: "plexuser" });
    render(<ConnectedAccountsCard />);

    expect(screen.getByText("plexuser")).toBeInTheDocument();
    const unlink = screen.getByRole("button", { name: enSettings.profile.connected.disconnect });
    expect(unlink).toBeEnabled();
    await userEvent.click(unlink);
    expect(plexUnlink.mutate).toHaveBeenCalledTimes(1);
  });

  it("blocks unlinking and shows the password hint when plex is linked without a password", () => {
    authUser = createMockUser({ plexLinked: true, hasPassword: false, plex_username: "plexuser" });
    render(<ConnectedAccountsCard />);

    expect(screen.getByText(enSettings.profile.connected.plex.needsPassword)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: enSettings.profile.connected.disconnect })).toBeDisabled();
  });

  it("renders the empty state when spotify is disabled and there is no user", () => {
    authUser = null;
    configQuery = createMockQuery<SpotifyConfig | undefined>({ spotify: { enabled: false, configured: false } });
    render(<ConnectedAccountsCard />);
    expect(screen.getByText(enSettings.profile.connected.empty)).toBeInTheDocument();
  });

  it("treats undefined config and status data as the disabled defaults", () => {
    authUser = null;
    configQuery = createMockQuery<SpotifyConfig | undefined>(undefined);
    statusQuery = createMockQuery<SpotifyStatus | undefined>(undefined);
    render(<ConnectedAccountsCard />);
    expect(screen.getByText(enSettings.profile.connected.empty)).toBeInTheDocument();
  });

  it("falls back to the generic connected label when no external username is present", () => {
    configQuery = createMockQuery<SpotifyConfig | undefined>({ spotify: { enabled: true, configured: true } });
    statusQuery = createMockQuery<SpotifyStatus | undefined>({ connected: true });
    render(<ConnectedAccountsCard />);
    expect(screen.getByText(enSettings.profile.connected.spotify.connected)).toBeInTheDocument();
  });

  it("falls back to the generic linked label when a plex user has no username", () => {
    authUser = createMockUser({ plexLinked: true, hasPassword: true, plex_username: null });
    render(<ConnectedAccountsCard />);
    expect(screen.getByText(enSettings.profile.connected.plex.linked)).toBeInTheDocument();
  });
});
