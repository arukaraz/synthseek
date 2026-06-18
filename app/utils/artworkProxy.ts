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

export function artworkProxySrc(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return url;
  }

  if (!isWhitelistedHost(parsed.hostname)) {
    return url;
  }

  return `/api/artwork?url=${encodeURIComponent(url)}`;
}
