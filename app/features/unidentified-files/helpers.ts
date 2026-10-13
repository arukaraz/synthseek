import { formatTrackDuration } from "@utils/formatters";

import type { ChipTone, EditionMismatch, ProposalFile, ProposalTrack, TrackVerdict, UnidentifiedGroup } from "./types";

export function lengthLabel(seconds: number | null): string {
  return seconds === null ? "–" : formatTrackDuration(seconds * 1000);
}

export function signedSeconds(delta: number): string {
  if (delta > 0) return `+${delta}`;
  if (delta < 0) return `−${Math.abs(delta)}`;
  return "0";
}

export function verdictTone(verdict: TrackVerdict): ChipTone {
  switch (verdict) {
    case "same":
      return "ok";
    case "different_length":
    case "different_version":
      return "warn";
    case "different_song":
      return "bad";
  }
}

export function folderName(folder: string): string {
  const slash = folder.lastIndexOf("/");
  return slash === -1 ? folder : folder.slice(slash + 1);
}

export function groupName(group: UnidentifiedGroup): string {
  if (group.fileCount === 1 && group.files[0]) return group.files[0].title;
  return group.album ?? folderName(group.folder);
}

export function groupFileIds(group: UnidentifiedGroup): string[] {
  return group.files.map((file) => file.id);
}

export function mappedTrackId(file: ProposalFile, overrides: ReadonlyMap<string, string | null>): string | null {
  return overrides.has(file.id) ? (overrides.get(file.id) ?? null) : file.proposedTrackId;
}

export function editionMismatch(
  files: ProposalFile[],
  tracks: ProposalTrack[],
  overrides: ReadonlyMap<string, string | null>
): EditionMismatch | null {
  for (const file of files) {
    if (mappedTrackId(file, overrides) !== null) continue;
    const number = Number.parseInt(file.fileName, 10);
    if (!Number.isFinite(number)) continue;
    const track = tracks.find((candidate) => candidate.number === number);
    if (track && file.verdicts[track.id] === "different_song") {
      return { number, song: track.title, file: file.title };
    }
  }
  return null;
}

export function displayYearAndLabel(year: string | null, label: string | null): string[] {
  return [year, label].filter((part): part is string => part !== null && part.length > 0);
}
