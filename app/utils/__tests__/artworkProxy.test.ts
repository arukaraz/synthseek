import { describe, it, expect } from "vitest";
import { artworkProxySrc } from "../artworkProxy";

describe("artworkProxySrc", () => {
  it("rewrites a Deezer CDN url through the proxy", () => {
    const url = "https://cdn-images.dzcdn.net/images/cover/abc/500x500.jpg";
    expect(artworkProxySrc(url)).toBe(`/api/artwork?url=${encodeURIComponent(url)}`);
  });

  it("rewrites the alternate Deezer CDN host", () => {
    const url = "https://e-cdns-images.dzcdn.net/images/artist/abc/264x264.jpg";
    expect(artworkProxySrc(url)).toBe(`/api/artwork?url=${encodeURIComponent(url)}`);
  });

  it("rewrites a Spotify subdomain via the dot-boundary match", () => {
    const url = "https://i.scdn.co/image/ab67616d0000b273abc";
    expect(artworkProxySrc(url)).toBe(`/api/artwork?url=${encodeURIComponent(url)}`);
  });

  it("rewrites a spotifycdn subdomain", () => {
    const url = "https://seed-mix-image.spotifycdn.com/v6/img/abc.jpg";
    expect(artworkProxySrc(url)).toBe(`/api/artwork?url=${encodeURIComponent(url)}`);
  });

  it("rewrites coverartarchive, fanart.tv and archive.org", () => {
    const cover = "https://coverartarchive.org/release/abc/front-500.jpg";
    const fanart = "https://assets.fanart.tv/fanart/music/abc/artistthumb/x.jpg";
    const archive = "https://ia800.archive.org/cover.jpg";
    expect(artworkProxySrc(cover)).toBe(`/api/artwork?url=${encodeURIComponent(cover)}`);
    expect(artworkProxySrc(fanart)).toBe(`/api/artwork?url=${encodeURIComponent(fanart)}`);
    expect(artworkProxySrc(archive)).toBe(`/api/artwork?url=${encodeURIComponent(archive)}`);
  });

  it("does NOT rewrite a suffix-collision host", () => {
    const url = "https://evilscdn.co/image/abc.jpg";
    expect(artworkProxySrc(url)).toBe(url);
  });

  it("does NOT rewrite a non-whitelisted domain", () => {
    const url = "https://example.com/image.jpg";
    expect(artworkProxySrc(url)).toBe(url);
  });

  it("passes through a relative path unchanged", () => {
    const url = "/images/local-cover.png";
    expect(artworkProxySrc(url)).toBe(url);
  });

  it("passes through a data url unchanged", () => {
    const url = "data:image/png;base64,iVBORw0KGgo=";
    expect(artworkProxySrc(url)).toBe(url);
  });

  it("passes through a blob url unchanged", () => {
    const url = "blob:https://app.local/abc-123";
    expect(artworkProxySrc(url)).toBe(url);
  });

  it("encodes the source url exactly once", () => {
    const url = "https://cdn-images.dzcdn.net/images/cover/a b/500x500.jpg?x=1&y=2";
    const result = artworkProxySrc(url);
    expect(result).toBe(`/api/artwork?url=${encodeURIComponent(url)}`);
    expect(result).toContain("a%20b");
    expect(result).toContain("x%3D1%26y%3D2");
    expect(result).not.toContain("a b");
  });
});
