import { getVersions } from "./changelog";

export const LANDING_URL = "https://synthseek.dev";

const [latest] = getVersions();

export const APP_VERSION = latest.version;
