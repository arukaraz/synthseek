import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockSettings } from "@test/mocks/feature-hooks.mock";
import { createMockMutation } from "@test/mocks/trpc.mock";

import { SECRET_SENTINEL } from "../../../components/constants";

const update = createMockMutation();
const testConnection = createMockMutation();
const toastSuccess = vi.hoisted(() => vi.fn());
const toastError = vi.hoisted(() => vi.fn());
const toastWarning = vi.hoisted(() => vi.fn());

const reveal = vi.hoisted(() => vi.fn());

vi.mock("@hooks/api/mutations/settings/useDownloadSources", () => ({
  useUpdateDownloadSources: () => update,
  useTestTorrentSource: () => testConnection,
}));

vi.mock("@hooks/api/mutations/settings/useRevealSecret", () => ({ useRevealSettingsSecret: () => reveal }));

vi.mock("sonner", () => ({
  toast: {
    success: (message: string) => toastSuccess(message),
    error: (message: string, options?: unknown) => toastError(message, options),
    warning: (message: string, options?: unknown) => toastWarning(message, options),
  },
}));

vi.mock("../StagedReleaseList", () => ({
  StagedReleaseList: ({ source }: { source: string }) => <div data-testid="staged-list" data-source={source} />,
}));

import { TorrentCard } from "../TorrentCard";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const initial = createMockSettings().downloadSources;
const t = enSettings.torrent;
const testButton = () => screen.getByRole("button", { name: t.test.action });

function typeInto(label: string, value: string): void {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

function fillAddresses(): void {
  typeInto(t.indexerUrl.label, "http://prowlarr:9696/1");
  typeInto(t.indexerApiKey.label, "indexer-key");
  typeInto(t.qbittorrentUrl.label, "http://qbittorrent:8080");
}

const healthy = {
  indexer: "ok",
  indexerReason: null,
  client: "ok",
  clientReason: null,
  clientVersion: "v5.2.4",
  warnings: [],
};

describe("TorrentCard", () => {
  it("asks for each saved secret by its own field when its eye is clicked", async () => {
    reveal.mockResolvedValue("real");
    const torrent = {
      ...initial.torrent,
      indexerApiKey: SECRET_SENTINEL,
      qbittorrentApiKey: SECRET_SENTINEL,
      qbittorrentPassword: SECRET_SENTINEL,
    };
    render(<TorrentCard initial={{ ...initial, torrent }} />);

    for (const eye of screen.getAllByLabelText(enSettings.shell.secretInput.reveal)) await userEvent.click(eye);

    expect(reveal.mock.calls.map(([ref]) => ref)).toEqual([
      { section: "downloadSources.torrent", field: "indexerApiKey" },
      { section: "downloadSources.torrent", field: "qbittorrentApiKey" },
      { section: "downloadSources.torrent", field: "qbittorrentPassword" },
    ]);
  });

  it("lets a connection be tested only once both addresses are filled in", () => {
    render(<TorrentCard initial={initial} />);
    expect(testButton()).toBeDisabled();

    typeInto(t.indexerUrl.label, "http://prowlarr:9696/1");
    expect(testButton()).toBeDisabled();
    typeInto(t.qbittorrentUrl.label, "http://qbittorrent:8080");
    expect(testButton()).toBeEnabled();
  });

  it("tests what the form holds, with the username and category trimmed, and says it connected", async () => {
    testConnection.mutateAsync.mockResolvedValue(healthy);
    render(<TorrentCard initial={initial} />);
    fillAddresses();
    typeInto(t.qbittorrentUsername.label, " admin ");
    typeInto(t.qbittorrentPassword.label, "secret");
    typeInto(t.category.label, " music ");

    await userEvent.click(testButton());

    await waitFor(() => expect(toastSuccess).toHaveBeenCalledWith(t.test.ok));
    expect(testConnection.mutateAsync).toHaveBeenCalledWith({
      indexerUrl: "http://prowlarr:9696/1",
      indexerApiKey: "indexer-key",
      qbittorrentUrl: "http://qbittorrent:8080",
      qbittorrentUsername: "admin",
      qbittorrentPassword: "secret",
      qbittorrentApiKey: "",
      category: "music",
    });
  });

  it("names the failing half, the indexer before the client, with the reason underneath", async () => {
    render(<TorrentCard initial={initial} />);
    fillAddresses();

    testConnection.mutateAsync.mockResolvedValueOnce({
      ...healthy,
      indexer: "failed",
      indexerReason: "Torznab indexer rejected the API key (HTTP 401)",
      client: "bad_credentials",
      clientReason: "wrong password",
    });
    await userEvent.click(testButton());
    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith(t.test.indexer.failed, {
        description: "Torznab indexer rejected the API key (HTTP 401)",
      })
    );

    testConnection.mutateAsync.mockResolvedValueOnce({ ...healthy, client: "host_rejected", clientReason: null });
    await userEvent.click(testButton());
    await waitFor(() => expect(toastError).toHaveBeenLastCalledWith(t.test.client.host_rejected, undefined));
    expect(toastSuccess).not.toHaveBeenCalled();
  });

  it("connects with a warning when qBittorrent would undo the source", async () => {
    testConnection.mutateAsync.mockResolvedValue({ ...healthy, warnings: ["removes_on_share_limit", "dht_off"] });
    render(<TorrentCard initial={initial} />);
    fillAddresses();

    await userEvent.click(testButton());

    await waitFor(() =>
      expect(toastWarning).toHaveBeenCalledWith(t.test.ok, {
        description: `${t.test.warning.removes_on_share_limit} ${t.test.warning.dht_off}`,
      })
    );
  });

  it("lists the waiting torrents even while single-track requests are off", () => {
    render(<TorrentCard initial={initial} />);

    expect(screen.getByTestId("staged-list")).toHaveAttribute("data-source", "torrent");
  });

  it("saves the source with the username and category trimmed, alongside every unchanged sibling source", async () => {
    render(<TorrentCard initial={initial} />);

    await userEvent.click(screen.getByRole("switch", { name: t.enable.ariaLabel }));
    fillAddresses();
    typeInto(t.qbittorrentUsername.label, " admin ");
    typeInto(t.category.label, " music ");
    fireEvent.change(screen.getByLabelText(t.minSeeders.ariaLabel), { target: { value: "3" } });
    await userEvent.click(screen.getByRole("switch", { name: t.singleTrackRequests.ariaLabel }));
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    await waitFor(() => {
      expect(update.mutateAsync).toHaveBeenCalledWith({
        ...initial,
        torrent: {
          ...initial.torrent,
          enabled: true,
          indexerUrl: "http://prowlarr:9696/1",
          indexerApiKey: "indexer-key",
          qbittorrentUrl: "http://qbittorrent:8080",
          qbittorrentUsername: "admin",
          category: "music",
          minSeeders: 3,
          singleTrackRequests: true,
        },
      });
    });
  });
});
