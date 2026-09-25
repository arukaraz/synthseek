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

const NAVIDROME = { url: " http://navidrome:4533 ", username: " ana ", password: "hunter2", playback: false };
const JELLYFIN = { url: "http://jellyfin:8096 ", apiKey: "key", playback: false };

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

  it("saves the playback switch with the connection, trimmed", async () => {
    navidromeUpdate.mutateAsync.mockResolvedValue({ ok: true });
    render(<NavidromeCard initial={NAVIDROME} />);

    await userEvent.click(screen.getByRole("switch", { name: "Play from Navidrome" }));
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    await waitFor(() =>
      expect(navidromeUpdate.mutateAsync).toHaveBeenCalledWith({
        url: "http://navidrome:4533",
        username: "ana",
        password: "hunter2",
        playback: true,
      })
    );
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

  it("saves the playback switch with the connection, trimmed", async () => {
    jellyfinUpdate.mutateAsync.mockResolvedValue({ ok: true });
    render(<JellyfinCard initial={JELLYFIN} />);

    await userEvent.click(screen.getByRole("switch", { name: "Play from Jellyfin" }));
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    await waitFor(() =>
      expect(jellyfinUpdate.mutateAsync).toHaveBeenCalledWith({
        url: "http://jellyfin:8096",
        apiKey: "key",
        playback: true,
      })
    );
  });

  it("cannot test without a key", () => {
    render(<JellyfinCard initial={{ ...JELLYFIN, apiKey: "" }} />);
    expect(screen.getByRole("button", { name: copy.test.action })).toBeDisabled();
  });
});
