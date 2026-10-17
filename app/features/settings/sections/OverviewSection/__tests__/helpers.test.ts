import { describe, expect, it } from "vitest";

import i18n from "@modules/i18n";
import { createMockJob, createMockSettings } from "@test/mocks/feature-hooks.mock";

import type { DownloadSourcesAvailability } from "../../../types";
import { connectionRows, jobsAtAGlance, setupChecks } from "../helpers";
import { availability } from "./fixtures";

const t = i18n.getFixedT("en", "settings");

type Settings = ReturnType<typeof createMockSettings>;

function settingsWith(change: (settings: Settings) => void): Settings {
  const settings = createMockSettings();
  change(settings);
  return settings;
}

function ordered(settings: Settings): Settings {
  const sources = settings.downloadSources;
  sources.torrent.priority = 1;
  sources.slskd.priority = 2;
  sources.archive.priority = 3;
  sources.ytdlp.priority = 4;
  sources.usenet.priority = 5;
  sources.soundcloud.priority = 6;
  sources.subsonic.priority = 7;
  return settings;
}

describe("connectionRows", () => {
  it("lists the download sources by priority, then Lidarr, the media servers and Spotify", () => {
    const rows = connectionRows(ordered(createMockSettings()), availability(), undefined, undefined);
    expect(rows.map((row) => row.id)).toEqual([
      "torrent",
      "slskd",
      "archive",
      "ytdlp",
      "usenet",
      "soundcloud",
      "subsonic",
      "lidarr",
      "plex",
      "navidrome",
      "jellyfin",
      "spotify",
    ]);
  });

  it("numbers the download sources by their place in the order", () => {
    const rows = connectionRows(ordered(createMockSettings()), availability(), undefined, undefined);
    expect(rows.slice(0, 3).map((row) => [row.name, row.role])).toEqual([
      [t("torrent.title"), t("overview.connections.downloadSource", { position: 1 })],
      [t("slskd.title"), t("overview.connections.downloadSource", { position: 2 })],
      [t("archive.title"), t("overview.connections.downloadSource", { position: 3 })],
    ]);
  });

  it("links each row to where it is set up", () => {
    const rows = connectionRows(ordered(createMockSettings()), availability(), undefined, undefined);
    const hrefs = Object.fromEntries(rows.map((row) => [row.id, row.href]));
    expect(hrefs).toMatchObject({
      torrent: "/settings/download-sources?source=torrent",
      slskd: "/settings/download-sources?source=slskd",
      lidarr: "/settings/download-sources?source=lidarr",
      plex: "/settings/media?server=plex",
      jellyfin: "/settings/media?server=jellyfin",
      spotify: "/settings/library/sources",
    });
  });

  it("names the roles of the fixed rows", () => {
    const rows = connectionRows(createMockSettings(), availability(), undefined, undefined);
    const byId = new Map(rows.map((row) => [row.id, row]));
    expect(byId.get("lidarr")?.role).toBe(t("overview.connections.handOff"));
    expect(byId.get("lidarr")?.name).toBe(t("lidarr.title"));
    expect(byId.get("navidrome")?.role).toBe(t("overview.connections.mediaServer"));
    expect(byId.get("navidrome")?.name).toBe("Navidrome");
    expect(byId.get("spotify")?.role).toBe(t("overview.connections.librarySource"));
    expect(byId.get("spotify")?.name).toBe(t("metadata.librarySources.spotify.title"));
  });

  it("reports a source as checking until availability arrives, then by its availability", () => {
    const settings = settingsWith((value) => {
      value.downloadSources.ytdlp.enabled = true;
    });
    const statusOf = (available: DownloadSourcesAvailability | undefined) =>
      connectionRows(settings, available, undefined, undefined).find((row) => row.id === "ytdlp")?.status;
    expect(statusOf(undefined)).toEqual({ tone: "muted", label: t("shell.sourceStatus.checking") });
    expect(statusOf(availability())).toEqual({ tone: "muted", label: t("shell.sourceStatus.notConfigured") });
    expect(statusOf(availability(["ytdlp"]))).toEqual({ tone: "success", label: t("shell.sourceStatus.on") });
  });

  it("reports a turned off source as off", () => {
    const rows = connectionRows(createMockSettings(), availability(["usenet"]), undefined, undefined);
    expect(rows.find((row) => row.id === "usenet")?.status).toEqual({
      tone: "muted",
      label: t("shell.sourceStatus.off"),
    });
  });

  it("passes the Slskd health to the Slskd row", () => {
    const settings = createMockSettings();
    const slskdOf = (health: "healthy" | "unhealthy") =>
      connectionRows(settings, availability(["slskd"]), health, undefined).find((row) => row.id === "slskd")?.status;
    expect(slskdOf("unhealthy")).toEqual({ tone: "danger", label: t("slskd.status.unhealthy") });
    expect(slskdOf("healthy")).toEqual({ tone: "success", label: t("slskd.status.healthy") });
  });

  it("passes the Lidarr health to the Lidarr row", () => {
    const settings = createMockSettings();
    const lidarrOf = (health: "healthy" | "unhealthy" | undefined) =>
      connectionRows(settings, availability(), undefined, health).find((row) => row.id === "lidarr")?.status;
    expect(lidarrOf("healthy")).toEqual({ tone: "success", label: t("lidarr.status.healthy") });
    expect(lidarrOf("unhealthy")).toEqual({ tone: "danger", label: t("lidarr.status.unhealthy") });
    expect(lidarrOf(undefined)).toEqual({ tone: "muted", label: t("lidarr.status.notConfigured") });
  });

  it("reports each media server by whether it is connected", () => {
    const settings = settingsWith((value) => {
      value.connections.plex = { url: "http://plex", token: "token" };
      value.connections.navidrome = { ...value.connections.navidrome, url: "http://navidrome", username: "user" };
    });
    const rows = connectionRows(settings, availability(), undefined, undefined);
    const statusOf = (id: string) => rows.find((row) => row.id === id)?.status;
    expect(statusOf("plex")).toEqual({ tone: "success", label: t("mediaServers.order.connected") });
    expect(statusOf("navidrome")).toEqual({ tone: "muted", label: t("mediaServers.order.notConnected") });
    expect(statusOf("jellyfin")).toEqual({ tone: "muted", label: t("mediaServers.order.notConnected") });
  });

  it.each([
    [
      "off when disabled",
      { enabled: false, clientId: "id", publicBaseUrl: "https://x" },
      "muted",
      "shell.sourceStatus.off",
    ],
    [
      "on when complete",
      { enabled: true, clientId: "id", publicBaseUrl: "https://x" },
      "success",
      "shell.sourceStatus.on",
    ],
    [
      "missing details without a client id",
      { enabled: true, clientId: "", publicBaseUrl: "https://x" },
      "warning",
      "overview.connections.missingDetails",
    ],
    [
      "missing details without a public URL",
      { enabled: true, clientId: "id", publicBaseUrl: "" },
      "warning",
      "overview.connections.missingDetails",
    ],
  ] as const)("reports Spotify as %s", (_name, spotify, tone, labelKey) => {
    const settings = settingsWith((value) => {
      value.connections.spotify = { ...spotify };
    });
    const row = connectionRows(settings, availability(), undefined, undefined).find((entry) => entry.id === "spotify");
    expect(row?.status).toEqual({ tone, label: t(labelKey) });
  });
});

describe("jobsAtAGlance", () => {
  const soon = new Date("2030-01-01T00:10:00Z");
  const later = new Date("2030-01-01T01:00:00Z");
  const latest = new Date("2030-01-02T00:00:00Z");

  const jobs = [
    createMockJob({ id: "library-sync", nextRun: later }),
    createMockJob({ id: "wanted-sweep", nextRun: null }),
    createMockJob({ id: "library-scan", lastStatus: "failed", nextRun: latest }),
    createMockJob({ id: "discovery-sweep", running: true, nextRun: latest }),
    createMockJob({ id: "media-server-sync", nextRun: soon }),
    createMockJob({ id: "scrobble-relay", listed: false, running: true }),
    createMockJob({ id: "library-loudness", enabled: false, running: true }),
  ];

  it("puts running jobs first, then failed ones, then the next to run, and drops the rest", () => {
    expect(jobsAtAGlance(jobs, 10).map((job) => job.id)).toEqual([
      "discovery-sweep",
      "library-scan",
      "media-server-sync",
      "library-sync",
      "wanted-sweep",
    ]);
  });

  it("orders jobs of the same rank by their next run", () => {
    const running = [
      createMockJob({ id: "usenet-staging-sweep", running: true, nextRun: latest }),
      createMockJob({ id: "playback-source-links", running: true, nextRun: soon }),
    ];
    expect(jobsAtAGlance(running, 10).map((job) => job.id)).toEqual(["playback-source-links", "usenet-staging-sweep"]);
  });

  it("keeps at most the limit", () => {
    expect(jobsAtAGlance(jobs, 3).map((job) => job.id)).toEqual([
      "discovery-sweep",
      "library-scan",
      "media-server-sync",
    ]);
  });

  it("leaves the input order alone", () => {
    const before = jobs.map((job) => job.id);
    jobsAtAGlance(jobs, 3);
    expect(jobs.map((job) => job.id)).toEqual(before);
  });
});

describe("setupChecks", () => {
  it("lists the four checks with where to fix each", () => {
    const checks = setupChecks(createMockSettings(), undefined);
    expect(checks.map((check) => [check.id, check.labelKey, check.href])).toEqual([
      ["source", "overview.setup.downloadSource", "/settings/download-sources"],
      ["mediaServer", "overview.setup.mediaServer", "/settings/media"],
      ["musicbrainz", "overview.setup.musicbrainzEmail", "/settings/metadata#connections.enrichment.musicbrainzEmail"],
      ["acoustid", "overview.setup.acoustidKey", "/settings/metadata#connections.enrichment.acoustidApiKey"],
    ]);
  });

  it("marks nothing done on a fresh install", () => {
    const settings = settingsWith((value) => {
      value.connections.enrichment.musicbrainzEmail = "   ";
    });
    expect(setupChecks(settings, undefined).map((check) => check.done)).toEqual([false, false, false, false]);
    expect(setupChecks(settings, availability())[0].done).toBe(false);
  });

  it("marks each check done once it is set up", () => {
    const settings = settingsWith((value) => {
      value.connections.jellyfin = { ...value.connections.jellyfin, url: "http://jellyfin", apiKey: "key" };
      value.connections.enrichment.musicbrainzEmail = "me@example.com";
      value.connections.enrichment.acoustidApiKey = "acoustid";
    });
    expect(setupChecks(settings, availability(["soundcloud"])).map((check) => check.done)).toEqual([
      true,
      true,
      true,
      true,
    ]);
  });
});
