import { describe, it, expect } from "vitest";
import { Disc3, ListMusic, Music } from "lucide-react";
import { ContentType } from "@api/__generated__/types";
import {
  getContentTypeBadgeColors,
  getContentTypeColor,
  getContentTypeIcon,
  getContentTypeLabel,
} from "../content-type-helpers";

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

describe("getContentTypeColor", () => {
  it("returns the text color class for each type", () => {
    expect(getContentTypeColor(ContentType.enum.track)).toBe("text-accent-400");
    expect(getContentTypeColor(ContentType.enum.album)).toBe("text-primary-400");
    expect(getContentTypeColor(ContentType.enum.playlist)).toBe("text-emerald-400");
    expect(getContentTypeColor(ContentType.enum.artist)).toBe("text-secondary-400");
  });
});

describe("getContentTypeBadgeColors", () => {
  it("returns the filled pill classes for each type", () => {
    expect(getContentTypeBadgeColors(ContentType.enum.album)).toContain("bg-primary-500");
    expect(getContentTypeBadgeColors(ContentType.enum.track)).toContain("bg-accent-500");
    expect(getContentTypeBadgeColors(ContentType.enum.artist)).toContain("bg-secondary-500");
    expect(getContentTypeBadgeColors(ContentType.enum.playlist)).toContain("bg-emerald-500");
  });
});
