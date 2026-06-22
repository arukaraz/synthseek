import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockMutation } from "@test/mocks/trpc.mock";
import { createMockUser } from "@test/mocks/feature-hooks.mock";
import type { PlexIntegrationCardProps } from "../types";

const updatePlex = createMockMutation();
const updateBehavior = createMockMutation();
const updateFormatting = createMockMutation();
const plexStart = vi.fn().mockResolvedValue(undefined);
const plexSaveServer = vi.fn().mockResolvedValue(undefined);
let plexState: { kind: string; servers?: { clientIdentifier: string; uri: string; name: string; local: boolean }[] } = {
  kind: "idle",
};

vi.mock("@hooks/api/mutations/settings/usePlexConnect", () => ({
  usePlexConnect: () => ({ state: plexState, start: plexStart, saveServer: plexSaveServer, reset: vi.fn() }),
}));

vi.mock("@hooks/api/mutations/settings/useUpdateConnections", () => ({
  useUpdateConnectionsPlex: () => updatePlex,
}));

vi.mock("@hooks/api/mutations/settings/useUpdateEngine", () => ({
  useUpdateEnginePlexBehavior: () => updateBehavior,
}));

vi.mock("@hooks/api/mutations/settings/useUpdateFormatting", () => ({
  useUpdateFormatting: () => updateFormatting,
}));

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ currentUser: createMockUser({ username: "alice" }), isAdmin: true, isLoading: false }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { toast } from "sonner";

import { PlexIntegrationCard } from "../PlexIntegrationCard";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  plexState = { kind: "idle" };
});

const connected: PlexIntegrationCardProps["initial"] = {
  connection: { url: "http://plex.local:32400", token: "tok" },
  behavior: { libraryScan: true, playlistSync: false },
  naming: { plexPlaylistUsernameAffix: "off", plexPlaylistUsernameSeparator: " - " },
};

const disconnected: PlexIntegrationCardProps["initial"] = {
  ...connected,
  connection: { url: "", token: "" },
};

describe("PlexIntegrationCard", () => {
  it("shows the connected status and a disconnect action when credentials are present", () => {
    render(<PlexIntegrationCard initial={connected} />);
    expect(screen.getByText(enSettings.plex.statusConnected)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: new RegExp(enSettings.plex.disconnect) })).toBeInTheDocument();
  });

  it("shows the not-connected status and hides disconnect when credentials are absent", () => {
    render(<PlexIntegrationCard initial={disconnected} />);
    expect(screen.getByText(enSettings.plex.statusNotConnected)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: new RegExp(enSettings.plex.disconnect) })).not.toBeInTheDocument();
  });

  it("starts the plex reconnect flow when reconnect is clicked", async () => {
    render(<PlexIntegrationCard initial={disconnected} />);

    await userEvent.click(screen.getByRole("button", { name: new RegExp(enSettings.plex.reconnect) }));

    await waitFor(() => expect(plexStart).toHaveBeenCalledTimes(1));
  });

  it("disconnects and toasts success", async () => {
    render(<PlexIntegrationCard initial={connected} />);

    await userEvent.click(screen.getByRole("button", { name: new RegExp(enSettings.plex.disconnect) }));

    await waitFor(() => {
      expect(updatePlex.mutateAsync).toHaveBeenCalledWith({ url: "", token: "" });
      expect(toast.success).toHaveBeenCalledWith(enSettings.plex.disconnected);
    });
  });

  it("renders the discovered servers and picks one when in the picking state", async () => {
    plexState = {
      kind: "picking",
      servers: [{ clientIdentifier: "id-1", uri: "http://server-1:32400", name: "Home Server", local: true }],
    };
    render(<PlexIntegrationCard initial={disconnected} />);

    await userEvent.click(screen.getByRole("button", { name: new RegExp(enSettings.plex.reconnect) }));
    await userEvent.click(screen.getByText("Home Server"));

    await waitFor(() => expect(plexSaveServer).toHaveBeenCalledWith("http://server-1:32400"));
  });

  it("saves the behavior section after toggling playlist sync", async () => {
    render(<PlexIntegrationCard initial={connected} />);

    await userEvent.click(screen.getByRole("switch", { name: enSettings.plex.playlistSync.label }));
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    await waitFor(() => {
      expect(updateBehavior.mutateAsync).toHaveBeenCalledWith({ libraryScan: true, playlistSync: true });
      expect(updateFormatting.mutateAsync).not.toHaveBeenCalled();
    });
  });
});
