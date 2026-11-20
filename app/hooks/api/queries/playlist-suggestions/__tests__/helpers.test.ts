import { describe, expect, it } from "vitest";

import { newSuggestionSeed, readSuggestionPages, suggestionGoneKey, withGone, withoutGone } from "../helpers";

const WIDER = 40;

function narrow(cursor: number, ...ids: string[]) {
  return { tracks: ids.map((externalId) => ({ externalId })), nextCursor: cursor + 1, widerCursor: WIDER };
}

function wide(cursor: number, ...ids: string[]) {
  return { tracks: ids.map((externalId) => ({ externalId })), nextCursor: cursor + 1, widerCursor: null };
}

describe("newSuggestionSeed", () => {
  it("stays inside the unsigned 32-bit range the server accepts", () => {
    expect(newSuggestionSeed(() => 0)).toBe(0);
    expect(newSuggestionSeed(() => 0.5)).toBe(0x80000000);
    expect(newSuggestionSeed(() => 1)).toBe(0xffffffff);
  });
});

describe("suggestionGoneKey", () => {
  it("keeps the rows taken out of one playlist's batch apart from another playlist's and another batch's", () => {
    expect(suggestionGoneKey({ playlistId: "pl-1", seed: 7 })).toEqual(["playlistSuggestionGone", "pl-1", 7]);
    expect(suggestionGoneKey({ playlistId: "pl-2", seed: 7 })).not.toEqual(
      suggestionGoneKey({ playlistId: "pl-1", seed: 7 })
    );
    expect(suggestionGoneKey({ playlistId: "pl-1", seed: 8 })).not.toEqual(
      suggestionGoneKey({ playlistId: "pl-1", seed: 7 })
    );
  });
});

describe("withGone", () => {
  it("adds the track to the ones taken out, once", () => {
    expect(withGone(undefined, "a")).toEqual(["a"]);
    expect(withGone(["a"], "b")).toEqual(["a", "b"]);
    expect(withGone(["a", "b"], "a")).toEqual(["a", "b"]);
  });
});

describe("withoutGone", () => {
  it("gives back that one track and leaves the others taken out", () => {
    expect(withoutGone(["a", "b", "c"], "b")).toEqual(["a", "c"]);
    expect(withoutGone(["a"], "z")).toEqual(["a"]);
    expect(withoutGone(undefined, "a")).toEqual([]);
  });
});

describe("readSuggestionPages", () => {
  it("leaves out the rows taken out of the list and keeps the others in their place", () => {
    const reading = readSuggestionPages([narrow(0, "a", "b"), narrow(1, "b", "c")], 2, new Set(["b"]));

    expect(reading.rows.map((track) => track.externalId)).toEqual(["a", "c"]);
  });

  it("still counts a page as having brought something when every row it brought was taken out since", () => {
    const pages = [narrow(0, "a"), narrow(1, "b"), narrow(2, "c")];

    const reading = readSuggestionPages(pages, 2, new Set(["a", "b", "c"]));

    expect(reading.rows).toEqual([]);
    expect(reading.nextCursor).toBe(3);
  });

  it("does not end a widened list because the rows of its last pages were taken out", () => {
    const pages = [wide(WIDER, "a"), wide(WIDER + 1, "b"), wide(WIDER + 2, "c")];

    expect(readSuggestionPages(pages, 2, new Set(["b", "c"])).nextCursor).toBe(WIDER + 3);
  });

  it("lists every page in order, shows a repeated track once, and reads on from the last page", () => {
    const reading = readSuggestionPages([narrow(0, "a", "b"), narrow(1, "b", "c")], 2);

    expect(reading.rows.map((track) => track.externalId)).toEqual(["a", "b", "c"]);
    expect(reading.nextCursor).toBe(2);
  });

  it("keeps reading the playlist's own artists while fewer pages than the limit came back with nothing new", () => {
    expect(readSuggestionPages([narrow(0, "a"), narrow(1, "a")], 2).nextCursor).toBe(2);
  });

  it("widens to related artists once that many pages in a row brought nothing new", () => {
    expect(readSuggestionPages([narrow(0, "a"), narrow(1, "a"), narrow(2)], 2).nextCursor).toBe(WIDER);
  });

  it("starts counting again when a page brings something new", () => {
    const pages = [narrow(0, "a"), narrow(1, "a"), narrow(2, "b"), narrow(3, "b")];

    expect(readSuggestionPages(pages, 2).nextCursor).toBe(4);
  });

  it("starts counting again on the first widened page, so the dry pages before it do not end the list", () => {
    const pages = [narrow(0, "a"), narrow(1, "a"), narrow(2), wide(WIDER, "a")];

    expect(readSuggestionPages(pages, 2).nextCursor).toBe(WIDER + 1);
  });

  it("ends the list once that many widened pages in a row brought nothing new", () => {
    const pages = [narrow(0, "a"), narrow(1, "a"), narrow(2), wide(WIDER, "a"), wide(WIDER + 1)];

    expect(readSuggestionPages(pages, 2).nextCursor).toBeNull();
  });

  it("ends where the server says there are no more pages", () => {
    expect(readSuggestionPages([{ ...wide(79, "a"), nextCursor: null }], 2).nextCursor).toBeNull();
  });

  it("has no rows and nothing to read before any page arrived", () => {
    expect(readSuggestionPages([], 2)).toEqual({ rows: [], nextCursor: null });
  });
});
