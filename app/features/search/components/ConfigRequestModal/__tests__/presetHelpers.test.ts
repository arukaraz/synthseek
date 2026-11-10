import { describe, expect, it } from "vitest";

import i18n from "@locale";
import { createMusicAlbum, createMusicPlaylistTrack, createMusicTrack } from "@test/factories";

import {
  acquisitionFromChain,
  presetFromSelection,
  selectionFromPreset,
  summarizePreset,
  tracksFromContents,
  withQualityMode,
} from "../helpers";
import type { DownloadSourceKey, RequestPreset, RequestSelection } from "../types";

const MP3_320: RequestPreset = {
  bitrate: { value: 320, matching: "flexible" },
  format: { value: "mp3", matching: "flexible" },
  minUploadSpeed: 0,
  requireFreeSlot: false,
};

const FLAC_ANY: RequestPreset = {
  bitrate: { value: 320, matching: "strict" },
  format: { value: "flac", matching: "flexible" },
  minUploadSpeed: 50,
  requireFreeSlot: true,
  sourceChain: ["slskd", "usenet"],
};

const OFFERED: DownloadSourceKey[] = ["slskd", "usenet", "ytdlp"];

function selection(overrides: Partial<RequestSelection> = {}): RequestSelection {
  return { ...selectionFromPreset(MP3_320, [...OFFERED]), ...overrides };
}

describe("tracksFromContents", () => {
  it("returns no tracks for a missing or failed response", () => {
    expect(tracksFromContents(undefined)).toEqual([]);
    expect(tracksFromContents({ success: false, content: [createMusicTrack()] })).toEqual([]);
  });

  it("keeps an album's tracks as they come", () => {
    const tracks = [createMusicTrack({ id: "a" }), createMusicTrack({ id: "b" })];
    expect(tracksFromContents({ success: true, content: tracks }).map((track) => track.id)).toEqual(["a", "b"]);
  });

  it("unwraps a playlist's entries into their tracks", () => {
    const entries = [
      createMusicPlaylistTrack(createMusicTrack({ id: "p1" })),
      createMusicPlaylistTrack(createMusicTrack({ id: "p2" })),
    ];
    expect(tracksFromContents({ success: true, content: entries }).map((track) => track.id)).toEqual(["p1", "p2"]);
  });

  it("finds no tracks in an artist's album list", () => {
    expect(tracksFromContents({ success: true, content: [createMusicAlbum()] })).toEqual([]);
  });
});

describe("acquisitionFromChain", () => {
  it("chooses sources automatically when the preset names none", () => {
    expect(acquisitionFromChain(undefined, [...OFFERED])).toEqual({
      mode: "auto",
      order: [...OFFERED],
      active: [...OFFERED],
    });
  });

  it("puts the preset's sources first, in its order, and leaves the rest off", () => {
    expect(acquisitionFromChain(["usenet", "slskd"], [...OFFERED])).toEqual({
      mode: "manual",
      order: ["usenet", "slskd", "ytdlp"],
      active: ["usenet", "slskd"],
    });
  });

  it("falls back to automatic when every source in the preset was switched off", () => {
    expect(acquisitionFromChain(["torrent"], [...OFFERED]).mode).toBe("auto");
  });
});

describe("selectionFromPreset and presetFromSelection", () => {
  it("reads a FLAC preset as lossless when its sources can deliver it", () => {
    const read = selectionFromPreset(FLAC_ANY, [...OFFERED]);
    expect(read).toMatchObject({ qualityMode: "lossless", formatMatching: "flexible", availability: "free" });
  });

  it("reads a FLAC preset as standard when none of its sources can deliver lossless", () => {
    expect(selectionFromPreset({ ...FLAC_ANY, sourceChain: ["usenet"] }, [...OFFERED]).qualityMode).toBe("standard");
  });

  it("gives back the preset it read", () => {
    expect(presetFromSelection(selectionFromPreset(FLAC_ANY, [...OFFERED]))).toEqual(FLAC_ANY);
    expect(presetFromSelection(selectionFromPreset(MP3_320, [...OFFERED]))).toEqual(MP3_320);
  });

  it("sends FLAC with the matching the user chose when lossless is picked", () => {
    const preset = presetFromSelection(selection({ qualityMode: "lossless", formatMatching: "flexible" }));
    expect(preset.format).toEqual({ value: "flac", matching: "flexible" });
  });
});

describe("withQualityMode", () => {
  it("starts lossless as strict, FLAC only", () => {
    expect(withQualityMode(selection(), "lossless")).toMatchObject({
      qualityMode: "lossless",
      formatMatching: "strict",
    });
  });

  it("keeps the matching the user set when going back to standard", () => {
    const lossless: RequestSelection = { ...withQualityMode(selection(), "lossless"), formatMatching: "flexible" };
    expect(withQualityMode(lossless, "standard")).toMatchObject({
      qualityMode: "standard",
      formatMatching: "flexible",
    });
  });

  it("leaves the selection alone when the mode does not change", () => {
    const current = selection();
    expect(withQualityMode(current, "standard")).toBe(current);
  });
});

describe("summarizePreset", () => {
  const t = i18n.getFixedT("en", "search");

  it("names the format, bitrate, matching and automatic sources", () => {
    expect(summarizePreset(MP3_320, t)).toBe("MP3 320 kbps (Flexible) · Auto");
  });

  it("names lossless and the source order", () => {
    expect(summarizePreset(FLAC_ANY, t)).toBe("Lossless (Flexible) · Slskd → Usenet");
  });
});
