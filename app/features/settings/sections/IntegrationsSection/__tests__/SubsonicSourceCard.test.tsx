import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockSettings } from "@test/mocks/feature-hooks.mock";
import { createMockMutation } from "@test/mocks/trpc.mock";
import { SECRET_SENTINEL } from "../../../components/constants";
import type { SubsonicSourceCardProps } from "../types";

const update = createMockMutation();
const testConnection = createMockMutation();
const toastSuccess = vi.hoisted(() => vi.fn());
const toastError = vi.hoisted(() => vi.fn());

const reveal = vi.hoisted(() => vi.fn());

vi.mock("@hooks/api/mutations/settings/useDownloadSources", () => ({
  useUpdateDownloadSources: () => update,
  useTestSubsonicSource: () => testConnection,
}));

vi.mock("@hooks/api/mutations/settings/useRevealSecret", () => ({ useRevealSettingsSecret: () => reveal }));

vi.mock("sonner", () => ({
  toast: {
    success: (message: string) => toastSuccess(message),
    error: (message: string, options?: unknown) => toastError(message, options),
  },
}));

import { SubsonicSourceCard } from "../SubsonicSourceCard";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const initial: SubsonicSourceCardProps["initial"] = {
  slskd: { enabled: true, priority: 0 },
  ytdlp: { enabled: true, priority: 10, searchResults: 5, maxDurationDeltaSec: 15, searchTimeout: 60000 },
  usenet: {
    enabled: false,
    priority: 5,
    indexerUrl: "",
    indexerApiKey: "",
    sabnzbdUrl: "",
    sabnzbdApiKey: "",
    maxSizeMb: 1000,
    minAgeHours: 1,
    searchTimeout: 30000,
    singleTrackRequests: false,
    stagingRetentionHours: 24,
  },
  archive: { enabled: false, priority: 20, collections: { netlabels: true, etree: false }, searchTimeout: 30000 },
  soundcloud: { enabled: false, priority: 12, searchResults: 15, maxDurationDeltaSec: 10, searchTimeout: 60000 },
  subsonic: { enabled: false, priority: 2, url: "", username: "", password: "", apiKey: "", searchTimeout: 30000 },
  torrent: createMockSettings().downloadSources.torrent,
};

const t = enSettings.subsonicSource;
const urlInput = () => screen.getByPlaceholderText(t.urlPlaceholder);
const testButton = () => screen.getByRole("button", { name: t.test.action });

function typeInto(label: string, value: string): void {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

describe("SubsonicSourceCard", () => {
  it("asks for each saved credential by its own field when its eye is clicked", async () => {
    reveal.mockResolvedValue("real");
    const subsonic = { ...initial.subsonic, apiKey: SECRET_SENTINEL, password: SECRET_SENTINEL };
    render(<SubsonicSourceCard initial={{ ...initial, subsonic }} />);

    for (const eye of screen.getAllByLabelText(enSettings.shell.secretInput.reveal)) await userEvent.click(eye);

    expect(reveal.mock.calls.map(([ref]) => ref)).toEqual([
      { section: "downloadSources.subsonic", field: "apiKey" },
      { section: "downloadSources.subsonic", field: "password" },
    ]);
  });

  it("only lets a connection be tested once there is an address and a key or a username and password", () => {
    render(<SubsonicSourceCard initial={initial} />);
    expect(testButton()).toBeDisabled();

    fireEvent.change(urlInput(), { target: { value: "http://friend:4533" } });
    expect(testButton()).toBeDisabled();
    typeInto(t.username, "me");
    expect(testButton()).toBeDisabled();
    typeInto(t.password, "secret");
    expect(testButton()).toBeEnabled();
  });

  it("tests with the typed address trimmed and reports the outcome, with the reason when there is one", async () => {
    testConnection.mutateAsync
      .mockResolvedValueOnce({ outcome: "ok", reason: null })
      .mockResolvedValueOnce({ outcome: "unreachable", reason: "ECONNREFUSED" });
    render(<SubsonicSourceCard initial={initial} />);
    fireEvent.change(urlInput(), { target: { value: "  http://friend:4533  " } });
    typeInto(t.apiKey, "the-key");

    await userEvent.click(testButton());
    await userEvent.click(testButton());

    expect(testConnection.mutateAsync).toHaveBeenCalledWith({
      url: "http://friend:4533",
      username: "",
      password: "",
      apiKey: "the-key",
    });
    expect(toastSuccess).toHaveBeenCalledWith(t.test.ok);
    expect(toastError).toHaveBeenCalledWith(t.test.unreachable, { description: "ECONNREFUSED" });
  });

  it("saves the source trimmed, alongside every unchanged sibling source", async () => {
    render(<SubsonicSourceCard initial={initial} />);

    await userEvent.click(screen.getByRole("switch", { name: t.enable.ariaLabel }));
    fireEvent.change(urlInput(), { target: { value: " http://friend:4533 " } });
    typeInto(t.username, " me ");
    typeInto(t.password, "secret");
    fireEvent.change(screen.getByLabelText(t.searchTimeout.ariaLabel), { target: { value: "45" } });
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    await waitFor(() => {
      expect(update.mutateAsync).toHaveBeenCalledWith({
        ...initial,
        subsonic: {
          ...initial.subsonic,
          enabled: true,
          url: "http://friend:4533",
          username: "me",
          password: "secret",
          searchTimeout: 45000,
        },
      });
    });
  });
});
