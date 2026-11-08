export interface ArtworkImage {
  src: string;
  unoptimized: boolean;
}

const ARTWORK_PROXY_PREFIX = "/api/artwork?url=";

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

  return `${ARTWORK_PROXY_PREFIX}${encodeURIComponent(url)}`;
}

function isProxiedArtworkSrc(src: string): boolean {
  return src.startsWith(ARTWORK_PROXY_PREFIX);
}

export function artworkProxySrc(url: string): string {
  return proxiedArtworkPath(url) ?? url;
}

export function artworkImage(url: string): ArtworkImage {
  if (isProxiedArtworkSrc(url)) return { src: url, unoptimized: false };
  const proxied = proxiedArtworkPath(url);
  return proxied === null ? { src: url, unoptimized: true } : { src: proxied, unoptimized: false };
}

export function sizedArtworkSrc(src: string, width: number): string {
  return isProxiedArtworkSrc(src) ? `${src}&w=${width}` : src;
}
