import { describe, it, expect } from "vitest";
import { isSingleTrackRequest } from "../request-helpers";
import { ContentType } from "@api/__generated__/types";
import { createTrackRequest } from "@test/factories";

describe("isSingleTrackRequest", () => {
  it("returns false for empty array", () => {
    expect(isSingleTrackRequest([])).toBe(false);
  });

  it("returns true for single track with type track", () => {
    const track = createTrackRequest({ request_type: ContentType.enum.track });
    expect(isSingleTrackRequest([track])).toBe(true);
  });

  it("returns false for single track with type album", () => {
    const track = createTrackRequest({ request_type: ContentType.enum.album });
    expect(isSingleTrackRequest([track])).toBe(false);
  });

  it("returns false for multiple tracks", () => {
    const tracks = [
      createTrackRequest({ request_type: ContentType.enum.track }),
      createTrackRequest({ request_type: ContentType.enum.track }),
    ];
    expect(isSingleTrackRequest(tracks)).toBe(false);
  });

  it("returns false for single track with type playlist", () => {
    const track = createTrackRequest({ request_type: ContentType.enum.playlist });
    expect(isSingleTrackRequest([track])).toBe(false);
  });

  it("returns false for single track with type artist", () => {
    const track = createTrackRequest({ request_type: ContentType.enum.artist });
    expect(isSingleTrackRequest([track])).toBe(false);
  });
});
