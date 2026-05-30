import { describe, it, expect } from "vitest";
import { Disc3, ListMusic, Music } from "lucide-react";
import { ContentType } from "@api/__generated__/types";
import { getContentTypeIcon, getContentTypeLabel } from "../content-type-helpers";

describe("getContentTypeLabel", () => {
  it("capitalizes each content type", () => {
    expect(getContentTypeLabel(ContentType.enum.track)).toBe("Track");
    expect(getContentTypeLabel(ContentType.enum.album)).toBe("Album");
    expect(getContentTypeLabel(ContentType.enum.artist)).toBe("Artist");
    expect(getContentTypeLabel(ContentType.enum.playlist)).toBe("Playlist");
  });
});

describe("getContentTypeIcon", () => {
  it("returns the matching Lucide icon", () => {
    expect(getContentTypeIcon(ContentType.enum.track)).toBe(Music);
    expect(getContentTypeIcon(ContentType.enum.album)).toBe(Disc3);
    expect(getContentTypeIcon(ContentType.enum.playlist)).toBe(ListMusic);
    expect(getContentTypeIcon(ContentType.enum.artist)).toBe(Music);
  });
});
