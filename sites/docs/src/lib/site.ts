import { getVersions } from "./changelog";
import { CHANNEL_FILE, DOCS_BASES, docsChannelOf, withBase } from "./channels.mjs";

export const LANDING_URL = "https://synthseek.dev";

const [latest] = getVersions();

export const APP_VERSION = latest.version;

export const DOCS_CHANNEL = docsChannelOf(import.meta.env.PUBLIC_DOCS_CHANNEL);

export const VERSION_LABEL = DOCS_CHANNEL === "beta" ? `v${APP_VERSION}-beta` : `v${APP_VERSION}`;

export const OWN_BASE = DOCS_BASES[DOCS_CHANNEL];

export const OTHER_CHANNEL_BASE = DOCS_CHANNEL === "beta" ? DOCS_BASES.stable : DOCS_BASES.beta;

export const OTHER_CHANNEL_FILE_URL = withBase(OTHER_CHANNEL_BASE, CHANNEL_FILE);

export const CHANNEL_MANIFEST = { channel: DOCS_CHANNEL, version: APP_VERSION, label: VERSION_LABEL };

export function docsHref(path: string): string {
  return withBase(OWN_BASE, path);
}
