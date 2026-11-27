import { BETA_UPSTREAM, DOCS_BASES } from "../../src/lib/channels.mjs";

const PREFIX = DOCS_BASES.beta.slice(0, -1);
const UPSTREAM_ORIGIN = new URL(BETA_UPSTREAM).origin;
const FORWARDED_HEADERS = [
  "accept",
  "accept-encoding",
  "accept-language",
  "if-none-match",
  "if-modified-since",
  "range",
];

function upstreamUrl(url) {
  const target = new URL(BETA_UPSTREAM);
  target.pathname = url.pathname.slice(PREFIX.length);
  target.search = url.search;
  return target;
}

function publicLocation(location) {
  const next = new URL(location, BETA_UPSTREAM);
  if (next.origin !== UPSTREAM_ORIGIN) return location;
  return `${PREFIX}${next.pathname}${next.search}${next.hash}`;
}

function forwardedHeaders(request) {
  const headers = new Headers();
  for (const name of FORWARDED_HEADERS) {
    const value = request.headers.get(name);
    if (value !== null) headers.set(name, value);
  }
  return headers;
}

export async function onRequest({ request }) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response(null, { status: 405, headers: { Allow: "GET, HEAD" } });
  }
  const url = new URL(request.url);
  if (url.pathname === PREFIX) {
    return new Response(null, { status: 308, headers: { Location: `${PREFIX}/${url.search}` } });
  }
  const response = await fetch(upstreamUrl(url), {
    method: request.method,
    headers: forwardedHeaders(request),
    redirect: "manual",
  });
  const location = response.headers.get("location");
  if (location === null) return response;
  const headers = new Headers(response.headers);
  headers.set("location", publicLocation(location));
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
