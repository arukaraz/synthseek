import { beforeAll, describe, expect, it } from "vitest";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockSettings } from "@test/mocks/feature-hooks.mock";

import { DAY_MS, HOUR_MS, MINUTE_MS, SERVER_PAGES, SETTINGS_PAGE_BY_ID, SETTINGS_ROOT, YOU_PAGES } from "../constants";
import {
  describeInterval,
  formatNextRun,
  isAdminOnlySettingsPath,
  isPathWithin,
  lidarrChainStatus,
  serverChainStatus,
  serverConnections,
  settingsHomeFor,
  settingsPageAt,
  sourceChainStatus,
  sourceOrderOf,
} from "../helpers";
import type { DownloadSourcesAvailability, DownloadSourcesConfig } from "../types";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

describe("isPathWithin", () => {
  it("matches the href itself and anything below it", () => {
    expect(isPathWithin("/settings/library", "/settings/library")).toBe(true);
    expect(isPathWithin("/settings/library/scan", "/settings/library")).toBe(true);
  });

  it("does not match a sibling that only shares a prefix", () => {
    expect(isPathWithin("/settings/library-sources", "/settings/library")).toBe(false);
    expect(isPathWithin("/settings", "/settings/library")).toBe(false);
  });
});

describe("settingsPageAt", () => {
  it("finds the page owning a nested path", () => {
    expect(settingsPageAt("/settings/library/scan")).toBe(SETTINGS_PAGE_BY_ID.library);
    expect(settingsPageAt("/settings/maintenance/recycle-bin")).toBe(SETTINGS_PAGE_BY_ID.maintenance);
  });

  it("finds no page for the root or an unknown path", () => {
    expect(settingsPageAt(SETTINGS_ROOT)).toBeUndefined();
    expect(settingsPageAt("/settings/unknown")).toBeUndefined();
  });
});

describe("isAdminOnlySettingsPath", () => {
  it.each(SERVER_PAGES.map((page) => [page.href]))("restricts the server page %s", (href) => {
    expect(isAdminOnlySettingsPath(href)).toBe(true);
    expect(isAdminOnlySettingsPath(`${href}/nested`)).toBe(true);
  });

  it.each(YOU_PAGES.map((page) => [page.href]))("leaves the personal page %s open", (href) => {
    expect(isAdminOnlySettingsPath(href)).toBe(false);
  });

  it("leaves the about page, the root and unknown paths open", () => {
    expect(isAdminOnlySettingsPath(SETTINGS_PAGE_BY_ID.about.href)).toBe(false);
    expect(isAdminOnlySettingsPath(SETTINGS_ROOT)).toBe(false);
    expect(isAdminOnlySettingsPath("/settings/unknown")).toBe(false);
  });

  it("covers every server page", () => {
    expect(SERVER_PAGES.map((page) => page.id)).toEqual([
      "overview",
      "members",
      "downloadSources",
      "engine",
      "library",
      "media",
      "metadata",
      "maintenance",
      "system",
    ]);
  });
});

describe("settingsHomeFor", () => {
  it("sends an admin to the overview and a member to their account", () => {
    expect(settingsHomeFor(true)).toBe(SETTINGS_PAGE_BY_ID.overview.href);
    expect(settingsHomeFor(false)).toBe(SETTINGS_PAGE_BY_ID.account.href);
  });
});

describe("describeInterval", () => {
  it("describes a single minute", () => {
    expect(describeInterval(MINUTE_MS)).toBe(enSettings.jobs.interval.everyMinute);
  });

  it("describes a sub-minute interval as a single minute", () => {
    expect(describeInterval(30_000)).toBe(enSettings.jobs.interval.everyMinute);
  });

  it("describes multiple minutes", () => {
    expect(describeInterval(5 * MINUTE_MS)).toBe(enSettings.jobs.interval.everyMinutes.replace("{{count}}", "5"));
  });

  it("describes a single hour", () => {
    expect(describeInterval(HOUR_MS)).toBe(enSettings.jobs.interval.everyHour);
  });

  it("describes multiple hours", () => {
    expect(describeInterval(3 * HOUR_MS)).toBe(enSettings.jobs.interval.everyHours.replace("{{count}}", "3"));
  });

  it("describes a single day", () => {
    expect(describeInterval(DAY_MS)).toBe(enSettings.jobs.interval.everyDay);
  });

  it("describes multiple days", () => {
    expect(describeInterval(2 * DAY_MS)).toBe(enSettings.jobs.interval.everyDays.replace("{{count}}", "2"));
  });
});

describe("formatNextRun", () => {
  const now = 1_000_000;

  it("returns the idle fallback when no date is given", () => {
    expect(formatNextRun(null, now)).toEqual({ value: enSettings.jobs.row.nextRunFallback });
  });

  it("returns now when the date is in the past", () => {
    expect(formatNextRun(new Date(now - 1000), now)).toEqual({ value: enSettings.jobs.nextRun.now });
  });

  it("returns now when the date is exactly now", () => {
    expect(formatNextRun(new Date(now), now)).toEqual({ value: enSettings.jobs.nextRun.now });
  });

  it("formats a sub-minute delay in seconds", () => {
    expect(formatNextRun(new Date(now + 45_000), now)).toEqual({ value: "45", unit: "s" });
  });

  it("formats a sub-hour delay in minutes", () => {
    expect(formatNextRun(new Date(now + 5 * MINUTE_MS), now)).toEqual({ value: "5", unit: "min" });
  });

  it("formats a sub-day delay in hours", () => {
    expect(formatNextRun(new Date(now + 3 * HOUR_MS), now)).toEqual({ value: "3", unit: "h" });
  });

  it("formats a multi-day delay in days", () => {
    expect(formatNextRun(new Date(now + 2 * DAY_MS), now)).toEqual({ value: "2", unit: "d" });
  });
});

const base = createMockSettings();

function prioritised(priorities: Record<keyof DownloadSourcesConfig, number>): DownloadSourcesConfig {
  const sources = base.downloadSources;
  return {
    slskd: { ...sources.slskd, priority: priorities.slskd },
    ytdlp: { ...sources.ytdlp, priority: priorities.ytdlp },
    usenet: { ...sources.usenet, priority: priorities.usenet },
    archive: { ...sources.archive, priority: priorities.archive },
    soundcloud: { ...sources.soundcloud, priority: priorities.soundcloud },
    subsonic: { ...sources.subsonic, priority: priorities.subsonic },
    torrent: { ...sources.torrent, priority: priorities.torrent },
  };
}

const allOn: DownloadSourcesConfig = {
  slskd: { ...base.downloadSources.slskd, enabled: true },
  ytdlp: { ...base.downloadSources.ytdlp, enabled: true },
  usenet: { ...base.downloadSources.usenet, enabled: true },
  archive: { ...base.downloadSources.archive, enabled: true },
  soundcloud: { ...base.downloadSources.soundcloud, enabled: true },
  subsonic: { ...base.downloadSources.subsonic, enabled: true },
  torrent: { ...base.downloadSources.torrent, enabled: true },
};

const available: DownloadSourcesAvailability = {
  slskd: { enabled: true, allowsSingleTracks: true },
  ytdlp: { enabled: true, allowsSingleTracks: true },
  usenet: { enabled: true, allowsSingleTracks: true },
  archive: { enabled: true, allowsSingleTracks: true },
  soundcloud: { enabled: true, allowsSingleTracks: true },
  subsonic: { enabled: true, allowsSingleTracks: true },
  torrent: { enabled: true, allowsSingleTracks: true },
};

const unavailable: DownloadSourcesAvailability = {
  ...available,
  usenet: { enabled: false, allowsSingleTracks: false },
  archive: { enabled: false, allowsSingleTracks: false },
};

describe("sourceOrderOf", () => {
  it("orders the sources by ascending priority", () => {
    const config = prioritised({
      slskd: 40,
      ytdlp: 5,
      usenet: 60,
      archive: 0,
      soundcloud: 20,
      subsonic: 10,
      torrent: 30,
    });

    expect(sourceOrderOf(config)).toEqual(["archive", "ytdlp", "subsonic", "soundcloud", "torrent", "slskd", "usenet"]);
  });

  it("keeps the catalog order between sources that share a priority", () => {
    const config = prioritised({ slskd: 1, ytdlp: 1, usenet: 1, archive: 0, soundcloud: 1, subsonic: 1, torrent: 1 });

    expect(sourceOrderOf(config)).toEqual(["archive", "slskd", "ytdlp", "usenet", "soundcloud", "subsonic", "torrent"]);
  });
});

describe("sourceChainStatus", () => {
  const status = enSettings.shell.sourceStatus;

  it("calls a switched-off source off before asking whether it is available", () => {
    const off = { ...allOn, usenet: { ...allOn.usenet, enabled: false } };

    expect(sourceChainStatus("usenet", off, available, "healthy")).toEqual({ tone: "muted", label: status.off });
  });

  it("says an enabled source is being checked while its availability is unknown", () => {
    expect(sourceChainStatus("usenet", allOn, undefined, undefined)).toEqual({
      tone: "muted",
      label: status.checking,
    });
  });

  it("calls an enabled source that cannot run not configured", () => {
    expect(sourceChainStatus("usenet", allOn, unavailable, undefined)).toEqual({
      tone: "muted",
      label: status.notConfigured,
    });
  });

  it("warns when the archive cannot run because every collection is off", () => {
    const noCollection = {
      ...allOn,
      archive: { ...allOn.archive, collections: { netlabels: false, etree: false, community: false } },
    };

    expect(sourceChainStatus("archive", noCollection, unavailable, undefined)).toEqual({
      tone: "warning",
      label: status.noCollection,
    });
  });

  it("calls an unavailable archive not configured while any collection is still on", () => {
    const communityOnly = {
      ...allOn,
      archive: { ...allOn.archive, collections: { netlabels: false, etree: false, community: true } },
    };

    expect(sourceChainStatus("archive", communityOnly, unavailable, undefined)).toEqual({
      tone: "muted",
      label: status.notConfigured,
    });
  });

  it("reports the Slskd health for Slskd only", () => {
    expect(sourceChainStatus("slskd", allOn, available, "unhealthy")).toEqual({
      tone: "danger",
      label: enSettings.slskd.status.unhealthy,
    });
    expect(sourceChainStatus("slskd", allOn, available, "healthy")).toEqual({
      tone: "success",
      label: enSettings.slskd.status.healthy,
    });
    expect(sourceChainStatus("torrent", allOn, available, "unhealthy")).toEqual({ tone: "success", label: status.on });
  });

  it("calls an available Slskd on while its health is unknown", () => {
    expect(sourceChainStatus("slskd", allOn, available, undefined)).toEqual({ tone: "success", label: status.on });
  });
});

describe("serverConnections", () => {
  const empty = base.connections;

  it("counts a server as connected only once every credential it needs is filled in", () => {
    expect(
      serverConnections({
        plex: { url: "http://plex:32400", token: "t" },
        navidrome: { url: "http://navidrome:4533", username: "a", password: "p", playlistSync: false },
        jellyfin: { url: "http://jellyfin:8096", apiKey: "k", playlistSync: false },
      })
    ).toEqual({ plex: true, navidrome: true, jellyfin: true });

    expect(
      serverConnections({
        plex: { url: "http://plex:32400", token: "" },
        navidrome: { url: "http://navidrome:4533", username: "a", password: "", playlistSync: false },
        jellyfin: { url: "", apiKey: "k", playlistSync: false },
      })
    ).toEqual({ plex: false, navidrome: false, jellyfin: false });
  });

  it("needs a Navidrome username as well as its password", () => {
    const connections = {
      ...empty,
      navidrome: { url: "http://navidrome:4533", username: "", password: "p", playlistSync: false },
    };

    expect(serverConnections(connections).navidrome).toBe(false);
  });
});

describe("serverChainStatus", () => {
  it("names a connected server connected and any other not connected", () => {
    expect(serverChainStatus(true)).toEqual({ tone: "success", label: enSettings.mediaServers.order.connected });
    expect(serverChainStatus(false)).toEqual({ tone: "muted", label: enSettings.mediaServers.order.notConnected });
  });
});

describe("lidarrChainStatus", () => {
  it("maps each Lidarr health to its tone and label", () => {
    expect(lidarrChainStatus("healthy")).toEqual({ tone: "success", label: enSettings.lidarr.status.healthy });
    expect(lidarrChainStatus("unhealthy")).toEqual({ tone: "danger", label: enSettings.lidarr.status.unhealthy });
    expect(lidarrChainStatus("not_configured")).toEqual({
      tone: "muted",
      label: enSettings.lidarr.status.notConfigured,
    });
  });

  it("treats an unknown health as not configured", () => {
    expect(lidarrChainStatus(undefined)).toEqual({ tone: "muted", label: enSettings.lidarr.status.notConfigured });
  });
});
