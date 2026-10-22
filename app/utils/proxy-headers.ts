const HOP_BY_HOP_HEADERS = new Set(["host", "connection", "keep-alive", "transfer-encoding", "expect"]);

export function clientAddressHeaders(source: Headers): Record<string, string> {
  const forwardedFor = source.get("x-forwarded-for");
  return forwardedFor ? { "x-forwarded-for": forwardedFor } : {};
}

export function forwardedRequestHeaders(source: Headers): Headers {
  const headers = new Headers();
  source.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) headers.set(key, value);
  });
  return headers;
}
