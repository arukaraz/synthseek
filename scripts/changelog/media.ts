import { join } from "node:path";

import { WHATS_NEW_IMAGE_EXTENSIONS, WHATS_NEW_MEDIA_DIR, WHATS_NEW_VIDEO_EXTENSIONS } from "./constants";
import type { ParsedChangelog } from "./schema";

function isNameCharacter(character: string): boolean {
  return (character >= "a" && character <= "z") || (character >= "0" && character <= "9") || character === "-";
}

function hasMediaName(value: string, extensions: string[]): boolean {
  const dot = value.lastIndexOf(".");
  if (dot <= 0) return false;
  const stem = value.slice(0, dot);
  if (stem.startsWith("-") || ![...stem].every(isNameCharacter)) return false;
  return extensions.includes(value.slice(dot + 1));
}

export function isImageFile(value: string): boolean {
  return hasMediaName(value, WHATS_NEW_IMAGE_EXTENSIONS);
}

export function isVideoFile(value: string): boolean {
  return hasMediaName(value, WHATS_NEW_VIDEO_EXTENSIONS);
}

function declaredMediaPaths(changelog: ParsedChangelog): string[] {
  return changelog.versions.flatMap((version) =>
    (version.highlights ?? []).flatMap((highlight) => {
      const media = highlight.media;
      if (!media) return [];
      const files = media.type === "video" && media.poster ? [media.file, media.poster] : [media.file];
      return files.map((file) => join(WHATS_NEW_MEDIA_DIR, version.version, file));
    })
  );
}

export function missingMediaPaths(changelog: ParsedChangelog, exists: (path: string) => boolean): string[] {
  return declaredMediaPaths(changelog).filter((path) => !exists(path));
}
