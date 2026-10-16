import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";
import { createMockSettings } from "@test/mocks/feature-hooks.mock";

import type { DownloadSourceKey } from "@api/__generated__/types";

import type { DownloadSourcesAvailability, LidarrHealth, SlskdHealth } from "../../../types";

type Settings = ReturnType<typeof createMockSettings>;

interface State {
  push: Mock;
  router: { push: Mock };
  settings: Settings | undefined;
  availability: DownloadSourcesAvailability | undefined;
  slskd: SlskdHealth | undefined;
  lidarr: LidarrHealth | undefined;
}

const state = vi.hoisted((): State => {
  const push = vi.fn();
  return {
    push,
    router: { push },
    settings: undefined,
    availability: undefined,
    slskd: undefined,
    lidarr: undefined,
  };
});

vi.mock("next/navigation", () => ({
  usePathname: () => "/settings/overview",
  useRouter: () => state.router,
}));

vi.mock("@hooks/api/queries/useSettings", () => ({
  useSettings: () => ({ data: state.settings }),
}));

vi.mock("@hooks/api/queries/useDownloadSourcesAvailability", () => ({
  useDownloadSourcesAvailability: () => ({ data: state.availability }),
}));

vi.mock("@hooks/api/queries/useSlskdStatus", () => ({
  useSlskdStatus: () => ({ data: state.slskd === undefined ? undefined : { configured: true, status: state.slskd } }),
}));

vi.mock("@hooks/api/queries/useLidarrStatus", () => ({
  useLidarrStatus: () => ({
    data: state.lidarr === undefined ? undefined : { configured: true, status: state.lidarr },
  }),
}));

import { ConnectionsCard } from "../components/ConnectionsCard";

const t = i18n.getFixedT("en", "settings");

function availability(enabled: readonly DownloadSourceKey[]): DownloadSourcesAvailability {
  const entry = (key: DownloadSourceKey) => ({ enabled: enabled.includes(key), allowsSingleTracks: true });
  return {
    slskd: entry("slskd"),
    ytdlp: entry("ytdlp"),
    usenet: entry("usenet"),
    archive: entry("archive"),
    soundcloud: entry("soundcloud"),
    subsonic: entry("subsonic"),
    torrent: entry("torrent"),
  };
}

function row(name: string): HTMLElement {
  const label = screen.getByText(name);
  const button = label.closest("button");
  expect(button).not.toBeNull();
  return button ?? label;
}

beforeEach(() => {
  state.push.mockReset();
  state.settings = createMockSettings();
  state.availability = availability(["slskd"]);
  state.slskd = "unhealthy";
  state.lidarr = "healthy";
});

describe("ConnectionsCard", () => {
  it("shows a loading line until the settings arrive", () => {
    state.settings = undefined;
    render(<ConnectionsCard />);
    expect(screen.getByRole("heading", { name: t("overview.connections.title") })).toBeInTheDocument();
    expect(screen.getByText(t("common.loading"))).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders a row per connection", () => {
    render(<ConnectionsCard />);
    expect(screen.getAllByRole("button")).toHaveLength(12);
    expect(screen.queryByText(t("common.loading"))).not.toBeInTheDocument();
  });

  it("shows the role and the live status of a source", () => {
    render(<ConnectionsCard />);
    expect(row(t("slskd.title"))).toHaveTextContent(
      `${t("slskd.title")}${t("overview.connections.downloadSource", { position: 1 })}${t("slskd.status.unhealthy")}`
    );
  });

  it("shows the Lidarr health", () => {
    render(<ConnectionsCard />);
    expect(row(t("lidarr.title"))).toHaveTextContent(t("lidarr.status.healthy"));
  });

  it("opens the place to set up a row", async () => {
    render(<ConnectionsCard />);
    await userEvent.click(row("Jellyfin"));
    expect(state.push).toHaveBeenCalledWith("/settings/media?server=jellyfin");
  });
});
