import { z } from "zod";

export const DOCS_SITE = "https://docs.synthseek.dev";

export const DOCS_BASES = {
  stable: "/",
  beta: "/v3-beta/",
};

export const BETA_UPSTREAM = "https://beta.synthseek-docs.pages.dev";

export const CHANNEL_FILE = "channel.json";

const DocsChannelSchema = z.enum(["stable", "beta"]).default("stable");

export function docsChannelOf(value) {
  return DocsChannelSchema.parse(value || undefined);
}

export function withBase(base, path) {
  return `${base}${path.startsWith("/") ? path.slice(1) : path}`;
}
