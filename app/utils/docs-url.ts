import { z } from "zod";

const DOCS_SITE = "https://docs.synthseek.dev";

const DocsChannelSchema = z.enum(["stable", "beta"]).catch("stable");

export function docsBase(channel: unknown, version: string): string {
  const major = version.split(".")[0];
  if (DocsChannelSchema.parse(channel) !== "beta" || !major) return "/";
  return `/v${major}-beta/`;
}

export function docsUrlFor(path: string, channel: unknown, version: string): string {
  const relative = path.startsWith("/") ? path.slice(1) : path;
  return `${DOCS_SITE}${docsBase(channel, version)}${relative}`;
}

export function docsUrl(path: string): string {
  return docsUrlFor(path, process.env.NEXT_PUBLIC_DOCS_CHANNEL, process.env.NEXT_PUBLIC_APP_VERSION ?? "");
}
