import { z } from "zod";

export const DOCS_ORIGINS = {
  stable: "https://docs.synthseek.dev",
  beta: "https://beta.docs.synthseek.dev",
};

export const CHANNEL_FILE = "/channel.json";

const DocsChannelSchema = z.enum(["stable", "beta"]).default("stable");

export function docsChannelOf(value) {
  return DocsChannelSchema.parse(value || undefined);
}
