import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { WHATS_NEW_IMAGE_EXTENSIONS, WHATS_NEW_VIDEO_EXTENSIONS } from "../changelog/constants";
import { isImageFile, isVideoFile, missingMediaPaths } from "../changelog/media";
import { changelogSchema, type ParsedChangelog } from "../changelog/schema";

function changelogWith(media: unknown, version = "3.0.0"): unknown {
  return {
    schemaVersion: 1,
    versions: [
      {
        version,
        date: "2026-11-10",
        type: "major",
        title: "Stage",
        highlights: [{ title: "Stage", body: "Full screen.", media }],
        sections: [],
      },
    ],
  };
}

const SAMPLE_NAMES = [
  "stage.mp4",
  "stage.webm",
  "stage-2.png",
  "board.jpg",
  "board.jpeg",
  "board.webp",
  "loop.gif",
  "Stage.png",
  "-stage.png",
  ".png",
  "stage",
  "stage.svg",
  "stage.PNG",
  "../stage.png",
  "a/b.png",
  "stage.mp4.png",
  "stage name.png",
  "stage_1.png",
  "stage.mov",
];

describe("highlight media in the changelog schema", () => {
  it("accepts an image and a video with its poster", () => {
    expect(changelogSchema.safeParse(changelogWith({ type: "image", file: "board.png", alt: "Board" })).success).toBe(
      true
    );
    const video = { type: "video", file: "stage.mp4", alt: "Stage", poster: "stage.webp" };
    expect(changelogSchema.safeParse(changelogWith(video)).success).toBe(true);
  });

  it.each([
    ["no alt", { type: "image", file: "board.png" }],
    ["a video file as an image", { type: "image", file: "stage.mp4", alt: "x" }],
    ["an image file as a video", { type: "video", file: "board.png", alt: "x" }],
    ["a path outside the version folder", { type: "image", file: "../board.png", alt: "x" }],
    ["a video poster that is not an image", { type: "video", file: "stage.mp4", alt: "x", poster: "a.mp4" }],
    ["an unknown type", { type: "audio", file: "a.mp3", alt: "x" }],
  ])("rejects %s", (_label, media) => {
    expect(changelogSchema.safeParse(changelogWith(media)).success).toBe(false);
  });

  it.each(["v3.1.0", "3.1", "3.1.0-beta", "3..0", "3.1.0.1"])(
    "rejects the version %s, whose media folder the server would not request",
    (version) => {
      expect(changelogSchema.safeParse(changelogWith(undefined, version)).success).toBe(false);
    }
  );
});

describe("missingMediaPaths", () => {
  const parsed: ParsedChangelog = changelogSchema.parse(
    changelogWith({ type: "video", file: "stage.mp4", alt: "Stage", poster: "stage.webp" })
  );

  it("lists the video and its poster under the version folder beside changelog.json", () => {
    expect(missingMediaPaths(parsed, () => false)).toEqual([
      "changelog-media/3.0.0/stage.mp4",
      "changelog-media/3.0.0/stage.webp",
    ]);
  });

  it("lists nothing when every declared file is on disk", () => {
    expect(missingMediaPaths(parsed, () => true)).toEqual([]);
  });
});

const serverRegexPath = resolve(process.cwd(), "../server/utils/helpers/string/regex.ts");
const serverUpdatesPath = resolve(process.cwd(), "../server/utils/constants/updates.ts");
const serverSourcePresent = existsSync(serverRegexPath) && existsSync(serverUpdatesPath);

function serverNamePattern(): RegExp {
  const source = readFileSync(serverRegexPath, "utf8");
  const literal = /WHATS_NEW_MEDIA_NAME_PATTERN = \/(.+)\/;/.exec(source)?.[1];
  if (literal === undefined) throw new Error("WHATS_NEW_MEDIA_NAME_PATTERN not found in the server regex module");
  return new RegExp(literal);
}

function serverExtensions(mapName: string): string[] {
  const source = readFileSync(serverUpdatesPath, "utf8");
  const start = source.indexOf(`${mapName}:`);
  if (start < 0) throw new Error(`${mapName} not found in the server updates constants`);
  const block = source.slice(start, source.indexOf("])", start));
  return [...block.matchAll(/\["\.([a-z0-9]+)"/g)].map((match) => match[1]);
}

function serverAccepts(name: string, mapName: string): boolean {
  const extension = name.slice(name.lastIndexOf(".") + 1);
  return serverNamePattern().test(name) && serverExtensions(mapName).includes(extension);
}

describe.skipIf(!serverSourcePresent)("highlight media name parity (web generator <-> server schema)", () => {
  it("accepts the same image and video extensions as the server", () => {
    expect(serverExtensions("WHATS_NEW_IMAGE_TYPES")).toEqual(WHATS_NEW_IMAGE_EXTENSIONS);
    expect(serverExtensions("WHATS_NEW_VIDEO_TYPES")).toEqual(WHATS_NEW_VIDEO_EXTENSIONS);
  });

  it.each(SAMPLE_NAMES)("judges %s the same way the server does", (name) => {
    expect(isImageFile(name)).toBe(serverAccepts(name, "WHATS_NEW_IMAGE_TYPES"));
    expect(isVideoFile(name)).toBe(serverAccepts(name, "WHATS_NEW_VIDEO_TYPES"));
  });
});

describe.runIf(!serverSourcePresent)("highlight media name parity (web generator <-> server schema)", () => {
  it.skip("parity skipped: server source unavailable in standalone web CI", () => {
    expect(serverSourcePresent).toBe(false);
  });
});
