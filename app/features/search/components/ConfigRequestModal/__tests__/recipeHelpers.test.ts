import { describe, expect, it } from "vitest";

import i18n from "@locale";

import {
  changedRecipeRows,
  chosenDestinationId,
  describeDestination,
  describeLidarr,
  describeMatching,
  describePeers,
  describeQuality,
  describeRow,
  describeSource,
  describeUploadSpeed,
  isRowChanged,
  recipeRows,
  restoreRow,
  sameAcquisition,
  selectionFromPreset,
  summarizeSelection,
} from "../helpers";
import type { DestinationPreview, DownloadSourceKey, LidarrProfiles, RequestPreset, RequestSelection } from "../types";

const t = i18n.getFixedT("en", "search");

const MP3_320: RequestPreset = {
  bitrate: { value: 320, matching: "flexible" },
  format: { value: "mp3", matching: "flexible" },
  minUploadSpeed: 0,
  requireFreeSlot: false,
};

const FLAC_STRICT: RequestPreset = {
  bitrate: { value: 320, matching: "strict" },
  format: { value: "flac", matching: "strict" },
  minUploadSpeed: 0,
  requireFreeSlot: false,
  sourceChain: ["slskd", "ytdlp"],
};

const OFFERED: DownloadSourceKey[] = ["slskd", "ytdlp"];

function base(preset: RequestPreset = MP3_320): RequestSelection {
  return selectionFromPreset(preset, [...OFFERED]);
}

function preview(overrides: Partial<DestinationPreview> = {}): DestinationPreview {
  return {
    pathId: "soundtracks",
    matched: [],
    winnerRuleId: null,
    lock: null,
    paths: [
      { id: "primary", label: "Music", accepts: true },
      { id: "soundtracks", label: "Soundtracks", accepts: true },
    ],
    ...overrides,
  };
}

const YOUTUBE_ONLY: RequestSelection["acquisition"] = {
  mode: "manual",
  order: ["ytdlp", "slskd"],
  active: ["ytdlp"],
};

describe("row descriptions", () => {
  it("describes a standard preset as format and bitrate, its sources and its peers", () => {
    expect(describeQuality(base(), t)).toBe("MP3 320 kbps");
    expect(describeSource(base().acquisition, t)).toBe("Auto");
    expect(describeMatching(base(), t)).toBe("Flexible");
    expect(describePeers(base(), t)).toBe("Any · Any peer");
    expect(summarizeSelection(base(), t)).toBe("MP3 320 kbps · Auto");
  });

  it("describes lossless by its matching, and only while a source can deliver it", () => {
    expect(describeQuality(base(FLAC_STRICT), t)).toBe("Lossless (Strict)");
    expect(describeSource(base(FLAC_STRICT).acquisition, t)).toBe("Slskd → YouTube");
    expect(describeQuality({ ...base(FLAC_STRICT), acquisition: YOUTUBE_ONLY }, t)).toBe("FLAC 320 kbps");
  });

  it("names both matchings when they differ", () => {
    expect(describeMatching({ ...base(), bitrateMatching: "strict" }, t)).toContain("Strict");
    expect(describeMatching({ ...base(), bitrateMatching: "strict" }, t)).toContain("Flexible");
  });

  it("falls back to KB/s for an upload speed with no option", () => {
    expect(describeUploadSpeed(3072, t)).toBe("3 KB/s");
  });

  it("names Lidarr with the chosen profile and root folder, skipping what is unset", () => {
    const profiles: LidarrProfiles = {
      qualityProfiles: [{ id: 4, name: "Lossless", upgradeAllowed: false, cutoff: 0, items: [] }],
      metadataProfiles: [],
      rootFolders: [],
      defaults: { rootFolderPath: undefined, qualityProfileId: undefined, metadataProfileId: undefined },
    };
    const selection = {
      rootFolderPath: "/music",
      qualityProfileId: 4,
      metadataProfileId: 1,
      monitor: "album",
      tags: [],
    };
    expect(describeLidarr(selection, profiles, t)).toBe("Lidarr · Lossless · /music");
    expect(describeLidarr({ ...selection, rootFolderPath: "" }, undefined, t)).toBe("Lidarr");
  });
});

describe("destination", () => {
  it("shows the rules' path until the admin picks another, and the locked path whatever they picked", () => {
    expect(describeDestination(preview(), null)).toBe("Soundtracks");
    expect(describeDestination(preview(), "primary")).toBe("Music");
    expect(chosenDestinationId(preview({ lock: { reason: "album_in_path", tracks: 2 } }), "primary")).toBe(
      "soundtracks"
    );
  });

  it("describes the destination row only when there is one", () => {
    expect(
      describeRow("destination", base(), { preview: preview(), value: null, onChange: () => {}, refreshing: false }, t)
    ).toBe("Soundtracks");
    expect(describeRow("destination", base(), null, t)).toBe("");
  });
});

describe("recipeRows", () => {
  it("lists every row for a standard preset that reaches Slskd and has a destination", () => {
    expect(recipeRows(base(), true)).toEqual(["source", "quality", "matching", "peer", "destination"]);
  });

  it("drops matching under lossless, matching and peers without Slskd, and destination when there is none", () => {
    expect(recipeRows(base(FLAC_STRICT), false)).toEqual(["source", "quality", "peer"]);
    expect(recipeRows({ ...base(), acquisition: YOUTUBE_ONLY }, false)).toEqual(["source", "quality"]);
  });

  it("keeps only the source row once Lidarr takes the request", () => {
    expect(recipeRows({ ...base(), acquisition: { ...base().acquisition, mode: "lidarr" } }, true)).toEqual(["source"]);
  });
});

describe("isRowChanged", () => {
  it("sees no change in the preset itself", () => {
    expect(changedRecipeRows(base(), base(), true, null)).toEqual([]);
  });

  it("ignores a reorder of the automatic chain but sees one of a manual chain", () => {
    const manual = base(FLAC_STRICT);
    const reordered: RequestSelection = {
      ...manual,
      acquisition: { mode: "manual", order: ["ytdlp", "slskd"], active: ["ytdlp", "slskd"] },
    };
    expect(sameAcquisition(base().acquisition, { ...base().acquisition, order: ["ytdlp", "slskd"] })).toBe(true);
    expect(isRowChanged("source", reordered, manual, null)).toBe(true);
  });

  it("counts the quality row on a bitrate, a format, or a switch to lossless", () => {
    expect(isRowChanged("quality", { ...base(), bitrate: 256 }, base(), null)).toBe(true);
    expect(isRowChanged("quality", { ...base(), format: "aac" }, base(), null)).toBe(true);
    expect(isRowChanged("quality", { ...base(), qualityMode: "lossless" }, base(), null)).toBe(true);
    expect(isRowChanged("quality", { ...base(), bitrateMatching: "strict" }, base(), null)).toBe(false);
  });

  it("counts a bitrate or bitrate matching hidden under lossless as a quality change, since both are still sent", () => {
    const lossless = base(FLAC_STRICT);
    expect(isRowChanged("quality", { ...lossless, bitrate: 256 }, lossless, null)).toBe(true);
    expect(isRowChanged("quality", { ...lossless, bitrateMatching: "flexible" }, lossless, null)).toBe(true);
    expect(restoreRow("quality", { ...lossless, bitrate: 256, bitrateMatching: "flexible" }, lossless)).toEqual(
      lossless
    );
  });

  it("leaves the quality row alone when only the source chain turns lossless off, since the same FLAC is sent", () => {
    const lossless = base(FLAC_STRICT);
    expect(isRowChanged("quality", { ...lossless, acquisition: YOUTUBE_ONLY }, lossless, null)).toBe(false);
  });

  it("counts the lossless matching as a quality change, not a matching one", () => {
    const lossless = base(FLAC_STRICT);
    expect(changedRecipeRows({ ...lossless, formatMatching: "flexible" }, lossless, false, null)).toEqual(["quality"]);
  });

  it("counts peers and a picked destination", () => {
    expect(changedRecipeRows({ ...base(), availability: "free" }, base(), true, null)).toEqual(["peer"]);
    expect(changedRecipeRows(base(), base(), true, "primary")).toEqual(["destination"]);
  });
});

describe("restoreRow", () => {
  it("puts back only the row asked for", () => {
    const changed: RequestSelection = { ...base(), bitrate: 256, availability: "free", bitrateMatching: "strict" };
    expect(restoreRow("quality", changed, base())).toEqual({
      ...base(),
      availability: "free",
      bitrateMatching: "strict",
    });
    expect(restoreRow("peer", changed, base())).toEqual({ ...base(), bitrate: 256, bitrateMatching: "strict" });
    expect(restoreRow("matching", changed, base())).toEqual({ ...base(), bitrate: 256, availability: "free" });
    expect(restoreRow("source", { ...base(), acquisition: YOUTUBE_ONLY }, base())).toEqual(base());
  });

  it("restores the matching with the quality when lossless was involved, since lossless set it", () => {
    const lossless: RequestSelection = { ...base(), qualityMode: "lossless", formatMatching: "strict" };
    expect(restoreRow("quality", lossless, base())).toEqual(base());
  });
});
