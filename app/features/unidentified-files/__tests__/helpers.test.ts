import { describe, expect, it } from "vitest";

import { editionMismatch, groupName, lengthLabel, mappedTrackId, signedSeconds, verdictTone } from "../helpers";
import type { ProposalFile, ProposalTrack, UnidentifiedGroup } from "../types";

function proposalFile(overrides: Partial<ProposalFile> = {}): ProposalFile {
  return {
    id: "f13",
    fileName: "13-trapt-panic_room.flac",
    relativePath: "Trapt/13-trapt-panic_room.flac",
    title: "Panic Room",
    artist: "Trapt",
    durationSeconds: 224,
    format: "flac",
    retrying: false,
    proposedTrackId: null,
    verdicts: { t13: "different_song" },
    ...overrides,
  };
}

const TRACK_13: ProposalTrack = {
  id: "t13",
  number: 13,
  disc: 1,
  title: "Human (Like The Rest Of Us) (Acoustic)",
  durationSeconds: 245,
};

describe("editionMismatch", () => {
  it("names the song that holds the file's number on this edition", () => {
    expect(editionMismatch([proposalFile()], [TRACK_13], new Map())).toEqual({
      number: 13,
      song: "Human (Like The Rest Of Us) (Acoustic)",
      file: "Panic Room",
    });
  });

  it("says nothing once the file has been given a song", () => {
    expect(editionMismatch([proposalFile()], [TRACK_13], new Map([["f13", "t13"]]))).toBeNull();
  });

  it("says nothing for a file name that carries no number", () => {
    expect(editionMismatch([proposalFile({ fileName: "Panic Room.flac" })], [TRACK_13], new Map())).toBeNull();
  });
});

describe("mappedTrackId", () => {
  it("keeps the proposal until someone changes it", () => {
    expect(mappedTrackId(proposalFile({ proposedTrackId: "t1" }), new Map())).toBe("t1");
  });

  it("follows a change to leave the file for later", () => {
    expect(mappedTrackId(proposalFile({ proposedTrackId: "t1" }), new Map([["f13", null]]))).toBeNull();
  });
});

describe("display helpers", () => {
  it("signs a length difference with a real minus", () => {
    expect(signedSeconds(1)).toBe("+1");
    expect(signedSeconds(-3)).toBe("−3");
    expect(signedSeconds(0)).toBe("0");
  });

  it("shows a dash for a length nobody measured", () => {
    expect(lengthLabel(null)).toBe("–");
    expect(lengthLabel(262)).toBe("4:22");
  });

  it("colours a verdict by how safe it is to accept", () => {
    expect(verdictTone("same")).toBe("ok");
    expect(verdictTone("different_version")).toBe("warn");
    expect(verdictTone("different_song")).toBe("bad");
  });

  it("names a single-file group after its song and a folder group after its album or folder", () => {
    const base: UnidentifiedGroup = {
      key: "k",
      folder: "Artist/Some Folder",
      album: null,
      artist: "Artist",
      discCount: 1,
      fileCount: 2,
      retrying: 0,
      ignoredAt: null,
      suggestedAlbumId: null,
      files: [],
    };
    expect(groupName(base)).toBe("Some Folder");
    expect(groupName({ ...base, album: "Album" })).toBe("Album");
  });
});
