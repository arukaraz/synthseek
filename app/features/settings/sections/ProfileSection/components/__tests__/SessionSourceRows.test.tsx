import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { LibrarySourceDescription } from "@hooks/api/queries/library-source/types";
import i18n from "@locale";
import enComponents from "@modules/i18n/messages/en/components.json";
import enSettings from "@modules/i18n/messages/en/settings.json";

const sourcesQuery = vi.hoisted(() => ({
  data: undefined as LibrarySourceDescription[] | undefined,
  isError: false,
}));
const disconnect = vi.hoisted(() => ({ mutate: vi.fn(), isPending: false }));

vi.mock("@hooks/api/queries/library-source/useLibrarySources", () => ({
  useLibrarySources: () => sourcesQuery,
}));

vi.mock("@hooks/api/mutations/library-source/useDisconnectLibrarySession", () => ({
  useDisconnectLibrarySession: () => disconnect,
}));

vi.mock("@hooks/api/mutations/library-source/useConnectLibrarySession", () => ({
  useConnectLibrarySession: () => ({ mutateAsync: vi.fn(), reset: vi.fn(), isPending: false }),
}));

import { SessionSourceRows } from "../SessionSourceRows";

function youtube(overrides: Partial<LibrarySourceDescription> = {}): LibrarySourceDescription {
  return {
    provider: "youtube",
    name: "YouTube",
    configured: true,
    connected: false,
    pending: false,
    needsReconnect: false,
    externalUsername: null,
    capabilities: {
      connect: "session",
      itemTypes: ["playlist", "liked"],
      watch: { playlists: true, savedAlbums: false },
      streamsAudio: false,
      playlistLinks: { accepted: true, needsConnection: false },
    },
    ...overrides,
  };
}

function spotify(): LibrarySourceDescription {
  return youtube({
    provider: "spotify",
    name: "Spotify",
    capabilities: {
      connect: "oauth",
      itemTypes: ["playlist", "album", "liked"],
      watch: { playlists: true, savedAlbums: true },
      streamsAudio: false,
      playlistLinks: { accepted: true, needsConnection: true },
    },
  });
}

function warningTitle() {
  return i18n.t("components:sessionConnect.warningTitle", { provider: "YouTube" });
}

beforeEach(() => {
  vi.clearAllMocks();
  sourcesQuery.data = undefined;
  sourcesQuery.isError = false;
  disconnect.isPending = false;
});

describe("SessionSourceRows", () => {
  it("lists only the sources that connect with a pasted session", () => {
    sourcesQuery.data = [spotify(), youtube()];

    const { container } = render(<SessionSourceRows />);

    expect(screen.getByText("YouTube")).toBeInTheDocument();
    expect(screen.queryByText("Spotify")).not.toBeInTheDocument();
    expect(container.querySelector('[data-anchor-target="youtube"]')).not.toBeNull();
  });

  it("hides a session source this server cannot read and nobody connected", () => {
    sourcesQuery.data = [youtube({ configured: false })];

    render(<SessionSourceRows />);

    expect(screen.queryByText("YouTube")).not.toBeInTheDocument();
  });

  it("offers the paste form with its warning while the member is not connected", () => {
    sourcesQuery.data = [youtube()];

    render(<SessionSourceRows />);

    expect(screen.getByText(enSettings.profile.connected.session.notConnected)).toBeInTheDocument();
    expect(screen.getByLabelText(enComponents.sessionConnect.label)).toBeInTheDocument();
    expect(screen.getByText(warningTitle())).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: enSettings.profile.connected.disconnect })).not.toBeInTheDocument();
  });

  it("names the connected account and offers no paste form", () => {
    sourcesQuery.data = [youtube({ connected: true, externalUsername: "Second channel" })];

    render(<SessionSourceRows />);

    expect(
      screen.getByText(i18n.t("settings:profile.connected.session.connectedAs", { username: "Second channel" }))
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(enComponents.sessionConnect.label)).not.toBeInTheDocument();
  });

  it("asks for a new paste, with the warning, when the saved session stopped working", () => {
    sourcesQuery.data = [youtube({ connected: true, needsReconnect: true })];

    render(<SessionSourceRows />);

    expect(
      screen.getByText(i18n.t("settings:profile.connected.session.needsReconnect", { provider: "YouTube" }))
    ).toBeInTheDocument();
    expect(screen.getByLabelText(enComponents.sessionConnect.label)).toBeInTheDocument();
    expect(screen.getByText(warningTitle())).toBeInTheDocument();
  });

  it("disconnects only after the member confirms", async () => {
    sourcesQuery.data = [youtube({ connected: true })];
    render(<SessionSourceRows />);

    await userEvent.click(screen.getByRole("button", { name: enSettings.profile.connected.disconnect }));
    expect(disconnect.mutate).not.toHaveBeenCalled();
    const dialog = screen.getByRole("dialog", {
      name: i18n.t("settings:profile.connected.session.disconnectTitle", { provider: "YouTube" }),
    });
    await userEvent.click(within(dialog).getByRole("button", { name: enSettings.profile.connected.disconnect }));

    expect(disconnect.mutate).toHaveBeenCalledWith({ provider: "youtube" });
  });

  it("says the sources could not be read instead of showing nothing", () => {
    sourcesQuery.isError = true;

    render(<SessionSourceRows />);

    expect(screen.getByText(enSettings.profile.connected.session.loadFailed)).toBeInTheDocument();
  });
});
