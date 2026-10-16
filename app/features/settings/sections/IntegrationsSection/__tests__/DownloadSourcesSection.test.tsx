import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor, within } from "@testing-library/react";
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

import type { DownloadSourceKey } from "@api/__generated__/types";

import type { DownloadSourcesAvailability, LidarrHealth, SlskdHealth } from "../../../types";

type Settings = ReturnType<typeof createMockSettings>;

const navigation = vi.hoisted(() => ({ search: "", replace: vi.fn() }));

let settingsQuery: MockQueryResult<Settings | undefined> = createMockQuery<Settings | undefined>(undefined);
let availabilityQuery: MockQueryResult<DownloadSourcesAvailability | undefined> = createMockQuery<
  DownloadSourcesAvailability | undefined
>(undefined);
let slskdQuery: MockQueryResult<{ status: SlskdHealth } | undefined> = createMockQuery<
  { status: SlskdHealth } | undefined
>(undefined);
let lidarrQuery: MockQueryResult<{ status: LidarrHealth } | undefined> = createMockQuery<
  { status: LidarrHealth } | undefined
>(undefined);
const updateOrder = createMockMutation();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: navigation.replace, push: vi.fn() }),
  usePathname: () => "/settings/download-sources",
  useSearchParams: () => new URLSearchParams(navigation.search),
}));

vi.mock("@hooks/api/queries/useSettings", () => ({ useSettings: () => settingsQuery }));
vi.mock("@hooks/api/queries/useDownloadSourcesAvailability", () => ({
  useDownloadSourcesAvailability: () => availabilityQuery,
}));
vi.mock("@hooks/api/queries/useSlskdStatus", () => ({ useSlskdStatus: () => slskdQuery }));
vi.mock("@hooks/api/queries/useLidarrStatus", () => ({ useLidarrStatus: () => lidarrQuery }));
vi.mock("@hooks/api/mutations/settings/useDownloadSources", () => ({
  useUpdateDownloadSourceOrder: () => updateOrder,
}));

const reveal = vi.hoisted(() => vi.fn());

vi.mock("../../../hooks/useRevealPanel", () => ({
  useRevealPanel: () => ({ panelRef: { current: null }, reveal }),
}));

vi.mock("../SlskdCard", () => ({ SlskdCard: () => <div data-testid="slskd-card" /> }));
vi.mock("../YtdlpCard", () => ({ YtdlpCard: () => <div data-testid="ytdlp-card" /> }));
vi.mock("../UsenetCard", () => ({ UsenetCard: () => <div data-testid="usenet-card" /> }));
vi.mock("../SubsonicSourceCard", () => ({ SubsonicSourceCard: () => <div data-testid="subsonic-card" /> }));
vi.mock("../TorrentCard", () => ({ TorrentCard: () => <div data-testid="torrent-card" /> }));
vi.mock("../SoundcloudCard", () => ({ SoundcloudCard: () => <div data-testid="soundcloud-card" /> }));
vi.mock("../ArchiveCard", () => ({ ArchiveCard: () => <div data-testid="archive-card" /> }));
vi.mock("../LidarrCard", () => ({ LidarrCard: () => <div data-testid="lidarr-card" /> }));

import { DownloadSourcesSection } from "../DownloadSourcesSection";

const TITLES: Record<DownloadSourceKey | "lidarr", string> = {
  slskd: enSettings.slskd.title,
  ytdlp: enSettings.ytdlp.title,
  usenet: enSettings.usenet.title,
  archive: enSettings.archive.title,
  soundcloud: enSettings.soundcloud.title,
  subsonic: enSettings.subsonicSource.title,
  torrent: enSettings.torrent.title,
  lidarr: enSettings.lidarr.title,
};

const CARDS = [
  "slskd-card",
  "subsonic-card",
  "usenet-card",
  "torrent-card",
  "ytdlp-card",
  "soundcloud-card",
  "archive-card",
  "lidarr-card",
];

const base = createMockSettings();

const settings: Settings = {
  ...base,
  downloadSources: {
    slskd: { ...base.downloadSources.slskd, enabled: true, priority: 2 },
    ytdlp: { ...base.downloadSources.ytdlp, enabled: true, priority: 4 },
    usenet: { ...base.downloadSources.usenet, enabled: true, priority: 5 },
    archive: {
      ...base.downloadSources.archive,
      enabled: true,
      priority: 1,
      collections: { netlabels: false, etree: false, community: false },
    },
    soundcloud: { ...base.downloadSources.soundcloud, enabled: false, priority: 6 },
    subsonic: { ...base.downloadSources.subsonic, enabled: false, priority: 3 },
    torrent: { ...base.downloadSources.torrent, enabled: true, priority: 0 },
  },
};

const SAVED_ORDER: DownloadSourceKey[] = ["torrent", "archive", "slskd", "subsonic", "ytdlp", "usenet", "soundcloud"];

const availability: DownloadSourcesAvailability = {
  slskd: { enabled: true, allowsSingleTracks: true },
  ytdlp: { enabled: true, allowsSingleTracks: true },
  usenet: { enabled: false, allowsSingleTracks: false },
  archive: { enabled: false, allowsSingleTracks: true },
  soundcloud: { enabled: false, allowsSingleTracks: true },
  subsonic: { enabled: false, allowsSingleTracks: true },
  torrent: { enabled: true, allowsSingleTracks: false },
};

const openName = (key: DownloadSourceKey | "lidarr") => i18n.t("settings:shell.chain.open", { name: TITLES[key] });
const moveUp = (key: DownloadSourceKey) => i18n.t("settings:shell.chain.moveUp", { name: TITLES[key] });
const moveDown = (key: DownloadSourceKey) => i18n.t("settings:shell.chain.moveDown", { name: TITLES[key] });

function chainOrder(): string[] {
  const names = new Set(SAVED_ORDER.map(openName));
  return screen
    .getAllByRole("button")
    .map((button) => button.getAttribute("aria-label") ?? "")
    .filter((name) => names.has(name));
}

function chainItem(key: DownloadSourceKey | "lidarr"): HTMLElement {
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
  availabilityQuery = createMockQuery<DownloadSourcesAvailability | undefined>(availability);
  slskdQuery = createMockQuery<{ status: SlskdHealth } | undefined>({ status: "unhealthy" });
  lidarrQuery = createMockQuery<{ status: LidarrHealth } | undefined>({ status: "healthy" });
  updateOrder.mutateAsync.mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("DownloadSourcesSection", () => {
  it("renders the loading state", () => {
    settingsQuery = createLoadingQuery<Settings | undefined>();
    render(<DownloadSourcesSection />);
    expect(screen.getByText(enSettings.common.loading)).toBeInTheDocument();
  });

  it("renders the error state with the failure reason", () => {
    settingsQuery = createErrorQuery<Settings | undefined>(new Error("boom"));
    render(<DownloadSourcesSection />);
    expect(screen.getByText(i18n.t("settings:common.loadFailedWithReason", { reason: "boom" }))).toBeInTheDocument();
  });

  it("lists the sources in the order of their stored priority", () => {
    render(<DownloadSourcesSection />);

    expect(chainOrder()).toEqual(SAVED_ORDER.map(openName));
  });

  it("shows each source's status from its switch, its availability and the Slskd health", () => {
    render(<DownloadSourcesSection />);

    expect(within(chainItem("torrent")).getByText(enSettings.shell.sourceStatus.on)).toBeInTheDocument();
    expect(within(chainItem("ytdlp")).getByText(enSettings.shell.sourceStatus.on)).toBeInTheDocument();
    expect(within(chainItem("archive")).getByText(enSettings.shell.sourceStatus.noCollection)).toBeInTheDocument();
    expect(within(chainItem("usenet")).getByText(enSettings.shell.sourceStatus.notConfigured)).toBeInTheDocument();
    expect(within(chainItem("soundcloud")).getByText(enSettings.shell.sourceStatus.off)).toBeInTheDocument();
    expect(within(chainItem("subsonic")).getByText(enSettings.shell.sourceStatus.off)).toBeInTheDocument();
    expect(within(chainItem("slskd")).getByText(enSettings.slskd.status.unhealthy)).toBeInTheDocument();
  });

  it("says an enabled source is still being checked while its availability has not arrived", () => {
    availabilityQuery = createMockQuery<DownloadSourcesAvailability | undefined>(undefined);
    render(<DownloadSourcesSection />);

    expect(within(chainItem("torrent")).getByText(enSettings.shell.sourceStatus.checking)).toBeInTheDocument();
    expect(within(chainItem("soundcloud")).getByText(enSettings.shell.sourceStatus.off)).toBeInTheDocument();
  });

  it("offers Lidarr as a hand off after the sources, with its own health", () => {
    lidarrQuery = createMockQuery<{ status: LidarrHealth } | undefined>({ status: "unhealthy" });
    render(<DownloadSourcesSection />);

    expect(screen.getByText(enSettings.shell.downloadSources.handOff)).toBeInTheDocument();
    expect(within(chainItem("lidarr")).getByText(enSettings.lidarr.status.unhealthy)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: i18n.t("settings:shell.chain.moveUp", { name: TITLES.lidarr }) })
    ).toBeNull();
  });

  it("keeps every card mounted and shows only the first source in the order when none is chosen", () => {
    render(<DownloadSourcesSection />);

    for (const card of CARDS) expect(screen.getByTestId(card)).toBeInTheDocument();
    expect(visibleCards()).toEqual(["torrent-card"]);
    expect(screen.getByRole("button", { name: openName("torrent") })).toHaveAttribute("aria-pressed", "true");
  });

  it("shows the card the URL names and keeps the others mounted behind it", () => {
    navigation.search = "source=lidarr";
    render(<DownloadSourcesSection />);

    expect(visibleCards()).toEqual(["lidarr-card"]);
    for (const card of CARDS) expect(screen.getByTestId(card)).toBeInTheDocument();
  });

  it("falls back to the first source when the URL names something that is not a source", () => {
    navigation.search = "source=spotify";
    render(<DownloadSourcesSection />);

    expect(visibleCards()).toEqual(["torrent-card"]);
  });

  it("puts the chosen source in the URL", async () => {
    render(<DownloadSourcesSection />);

    await userEvent.click(screen.getByRole("button", { name: openName("usenet") }));

    expect(navigation.replace).toHaveBeenCalledWith("/settings/download-sources?source=usenet", { scroll: false });
  });

  it("brings the chosen source's panel into view, Lidarr included", async () => {
    render(<DownloadSourcesSection />);

    await userEvent.click(screen.getByRole("button", { name: openName("usenet") }));
    expect(reveal).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole("button", { name: openName("lidarr") }));
    expect(reveal).toHaveBeenCalledTimes(2);
  });

  it("holds a moved source as a draft and saves the whole order through the order mutation", async () => {
    render(<DownloadSourcesSection />);
    expect(screen.queryByRole("button", { name: enSettings.shell.saveBar.save })).toBeNull();

    await userEvent.click(screen.getByRole("button", { name: moveUp("usenet") }));

    const drafted: DownloadSourceKey[] = ["torrent", "archive", "slskd", "subsonic", "usenet", "ytdlp", "soundcloud"];
    expect(chainOrder()).toEqual(drafted.map(openName));
    expect(updateOrder.mutateAsync).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    expect(updateOrder.mutateAsync).toHaveBeenCalledWith({ order: drafted });
    await waitFor(() => expect(screen.queryByRole("button", { name: enSettings.shell.saveBar.save })).toBeNull());
  });

  it("drops the draft when a source is moved back to where it was saved", async () => {
    render(<DownloadSourcesSection />);

    await userEvent.click(screen.getByRole("button", { name: moveUp("usenet") }));
    await userEvent.click(screen.getByRole("button", { name: moveDown("usenet") }));

    expect(chainOrder()).toEqual(SAVED_ORDER.map(openName));
    expect(screen.queryByRole("button", { name: enSettings.shell.saveBar.save })).toBeNull();
  });

  it("puts the saved order back when the draft is cancelled", async () => {
    render(<DownloadSourcesSection />);

    await userEvent.click(screen.getByRole("button", { name: moveDown("torrent") }));
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.cancel }));

    expect(chainOrder()).toEqual(SAVED_ORDER.map(openName));
    expect(updateOrder.mutateAsync).not.toHaveBeenCalled();
  });
});
