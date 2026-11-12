import { describe, expect, it } from "vitest";

import { historyRanges, leavingRows } from "../helpers";
import type { ListeningConnectionView, SourceAccountView } from "../types";

function connection(overrides: Partial<ListeningConnectionView> = {}): ListeningConnectionView {
  return {
    service: "lastfm",
    connected: true,
    configured: true,
    externalUsername: "nexus",
    scrobbleEnabled: true,
    relayedClients: [],
    lastFailure: null,
    ...overrides,
  };
}

function account(overrides: Partial<SourceAccountView> = {}): SourceAccountView {
  return {
    server: "plex",
    linkMethod: "plex",
    connected: true,
    externalUsername: "nexus",
    reportEnabled: true,
    lastFailure: null,
    ...overrides,
  };
}

describe("historyRanges", () => {
  it("offers every range that has a label, shortest first", () => {
    expect(historyRanges()).toEqual(["hour", "day", "week", "all"]);
  });
});

describe("leavingRows", () => {
  it("tells a service that sends plays from one that is connected but off and one never connected", () => {
    const rows = leavingRows(
      [
        connection(),
        connection({ service: "listenbrainz", scrobbleEnabled: false }),
        connection({ service: "lastfm", connected: false }),
      ],
      []
    );

    expect(rows.map((row) => row.status)).toEqual(["on", "off", "notConnected"]);
  });

  it("reports a disconnected service as not connected even when its switch was left on", () => {
    expect(leavingRows([connection({ connected: false, scrobbleEnabled: true })], [])).toEqual([
      { kind: "scrobble", id: "lastfm", status: "notConnected" },
    ]);
  });

  it("adds every playback server after the scrobblers, each with its own play count switch", () => {
    const rows = leavingRows(
      [connection()],
      [
        account({ server: "navidrome" }),
        account({ reportEnabled: false }),
        account({ server: "jellyfin", connected: false }),
      ]
    );

    expect(rows).toEqual([
      { kind: "scrobble", id: "lastfm", status: "on" },
      { kind: "server", id: "navidrome", status: "on" },
      { kind: "server", id: "plex", status: "off" },
      { kind: "server", id: "jellyfin", status: "notConnected" },
    ]);
  });
});
