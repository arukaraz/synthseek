import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockMutation } from "@test/mocks/trpc.mock";

const navidromeUpdate = createMockMutation();
const navidromeTest = createMockMutation();
const jellyfinUpdate = createMockMutation();
const jellyfinTest = createMockMutation();
let navidromeTestResult: { outcome: "ok" | "unauthorized" | "failed"; realPaths: boolean | null } | undefined;

vi.mock("@hooks/api/mutations/settings/useUpdateConnections", () => ({
  useUpdateConnectionsNavidrome: () => navidromeUpdate,
  useTestNavidrome: () => ({ ...navidromeTest, data: navidromeTestResult }),
  useUpdateConnectionsJellyfin: () => jellyfinUpdate,
  useTestJellyfin: () => jellyfinTest,
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { toast } from "sonner";

import { JellyfinCard } from "../JellyfinCard";
import { NavidromeCard } from "../NavidromeCard";

const copy = enSettings.mediaServers;

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  navidromeTestResult = undefined;
});

const NAVIDROME = {
  url: " http://navidrome:4533 ",
  username: " ana ",
  password: "hunter2",
  playlistSync: false,
};
const JELLYFIN = { url: "http://jellyfin:8096 ", apiKey: "key", playlistSync: false };

describe("NavidromeCard", () => {
  it("tests the typed credentials and says what the server answered", async () => {
    navidromeTest.mutateAsync
      .mockResolvedValueOnce({ outcome: "ok" })
      .mockResolvedValueOnce({ outcome: "unauthorized" });
    render(<NavidromeCard initial={NAVIDROME} />);
    const button = screen.getByRole("button", { name: copy.test.action });

    await userEvent.click(button);
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith(copy.test.ok));
    expect(navidromeTest.mutateAsync).toHaveBeenCalledWith({
      url: "http://navidrome:4533",
      username: "ana",
      password: "hunter2",
    });

    await userEvent.click(button);
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(copy.test.unauthorized));
  });

  it("tells the admin how to show real file paths when Navidrome hides them, and only then", () => {
    navidromeTestResult = { outcome: "ok", realPaths: false };
    render(<NavidromeCard initial={NAVIDROME} />);
    expect(screen.getByText(copy.navidrome.syntheticPaths)).toBeInTheDocument();
    cleanup();

    navidromeTestResult = { outcome: "ok", realPaths: true };
    render(<NavidromeCard initial={NAVIDROME} />);
    expect(screen.queryByText(copy.navidrome.syntheticPaths)).not.toBeInTheDocument();
    cleanup();

    navidromeTestResult = { outcome: "unauthorized", realPaths: null };
    render(<NavidromeCard initial={NAVIDROME} />);
    expect(screen.queryByText(copy.navidrome.syntheticPaths)).not.toBeInTheDocument();
  });

  it("cannot test until every credential is filled in", () => {
    render(<NavidromeCard initial={{ ...NAVIDROME, password: "" }} />);
    expect(screen.getByRole("button", { name: copy.test.action })).toBeDisabled();
  });

  it("has no switch for playing from it, since connecting is what makes it a place to play from", () => {
    render(<NavidromeCard initial={NAVIDROME} />);

    expect(screen.getAllByRole("switch").map((control) => control.getAttribute("aria-label"))).toEqual([
      "Sync playlists to Navidrome",
    ]);
  });

  it("offers playlist sync once connected and saves it with the connection, trimmed", async () => {
    navidromeUpdate.mutateAsync.mockResolvedValue({ ok: true });
    render(<NavidromeCard initial={NAVIDROME} />);
    const sync = screen.getByRole("switch", { name: "Sync playlists to Navidrome" });

    expect(sync).toBeEnabled();
    await userEvent.click(sync);
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    await waitFor(() =>
      expect(navidromeUpdate.mutateAsync).toHaveBeenCalledWith({
        url: "http://navidrome:4533",
        username: "ana",
        password: "hunter2",
        playlistSync: true,
      })
    );
  });

  it("keeps playlist sync off until every credential is filled in, and says why", () => {
    render(<NavidromeCard initial={{ ...NAVIDROME, password: "", playlistSync: true }} />);
    const sync = screen.getByRole("switch", { name: "Sync playlists to Navidrome" });

    expect(sync).toBeDisabled();
    expect(sync).not.toBeChecked();
    expect(screen.getByText(copy.playlistSync.needsConnection.replace("{{server}}", "Navidrome"))).toBeInTheDocument();
  });
});

describe("JellyfinCard", () => {
  it("tests the key and reports an unreachable server as an error", async () => {
    jellyfinTest.mutateAsync.mockResolvedValueOnce({ outcome: "failed" });
    render(<JellyfinCard initial={JELLYFIN} />);

    await userEvent.click(screen.getByRole("button", { name: copy.test.action }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(copy.test.failed));
    expect(jellyfinTest.mutateAsync).toHaveBeenCalledWith({ url: "http://jellyfin:8096", apiKey: "key" });
  });

  it("saves playlist sync with the connection, trimmed", async () => {
    jellyfinUpdate.mutateAsync.mockResolvedValue({ ok: true });
    render(<JellyfinCard initial={JELLYFIN} />);

    await userEvent.click(screen.getByRole("switch", { name: "Sync playlists to Jellyfin" }));
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    await waitFor(() =>
      expect(jellyfinUpdate.mutateAsync).toHaveBeenCalledWith({
        url: "http://jellyfin:8096",
        apiKey: "key",
        playlistSync: true,
      })
    );
  });

  it("says what syncing does once connected", () => {
    render(<JellyfinCard initial={{ ...JELLYFIN, playlistSync: true }} />);
    const sync = screen.getByRole("switch", { name: "Sync playlists to Jellyfin" });

    expect(sync).toBeEnabled();
    expect(sync).toBeChecked();
    expect(screen.getByText(/in their own Jellyfin account/)).toBeInTheDocument();
  });

  it("cannot test or sync without a key", () => {
    render(<JellyfinCard initial={{ ...JELLYFIN, apiKey: "" }} />);
    expect(screen.getByRole("button", { name: copy.test.action })).toBeDisabled();
    expect(screen.getByRole("switch", { name: "Sync playlists to Jellyfin" })).toBeDisabled();
  });
});
