export interface ArtworkImage {
  src: string;
  unoptimized: boolean;
}

const ARTWORK_PROXY_HOSTS = [
  "cdn-images.dzcdn.net",
  "e-cdns-images.dzcdn.net",
  "coverartarchive.org",
  "archive.org",
  "assets.fanart.tv",
  "scdn.co",
  "spotifycdn.com",
];

function isWhitelistedHost(hostname: string): boolean {
  return ARTWORK_PROXY_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`));
}

function proxiedArtworkPath(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return null;
  }

  if (!isWhitelistedHost(parsed.hostname)) {
    return null;
  }

  return `/api/artwork?url=${encodeURIComponent(url)}`;
}

export function artworkProxySrc(url: string): string {
  return proxiedArtworkPath(url) ?? url;
}

export function artworkImage(url: string): ArtworkImage {
  const proxied = proxiedArtworkPath(url);
  return proxied === null ? { src: url, unoptimized: true } : { src: proxied, unoptimized: false };
}
