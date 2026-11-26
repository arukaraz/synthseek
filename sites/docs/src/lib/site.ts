import { getVersions } from "./changelog";
import { CHANNEL_FILE, DOCS_ORIGINS, docsChannelOf } from "./channels.mjs";

export const LANDING_URL = "https://synthseek.dev";

const [latest] = getVersions();

export const APP_VERSION = latest.version;

export const DOCS_CHANNEL = docsChannelOf(import.meta.env.PUBLIC_DOCS_CHANNEL);

export const VERSION_LABEL = DOCS_CHANNEL === "beta" ? `v${APP_VERSION}-beta` : `v${APP_VERSION}`;

export const OTHER_CHANNEL_ORIGIN = DOCS_CHANNEL === "beta" ? DOCS_ORIGINS.stable : DOCS_ORIGINS.beta;

export const OTHER_CHANNEL_FILE_URL = `${OTHER_CHANNEL_ORIGIN}${CHANNEL_FILE}`;

export const CHANNEL_MANIFEST = { channel: DOCS_CHANNEL, version: APP_VERSION, label: VERSION_LABEL };
