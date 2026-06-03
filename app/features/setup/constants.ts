import { z } from "zod";

import type { WizardStep } from "./types";

export const STEPS: WizardStep[] = ["admin", "slskd", "plex", "enrichment", "done"];

export const ADMIN_EMAIL_SCHEMA = z.email();

export const SETUP_HEADING_IDS: Record<WizardStep, string> = {
  admin: "setup-step-admin-heading",
  slskd: "setup-step-slskd-heading",
  plex: "setup-step-plex-heading",
  enrichment: "setup-step-enrichment-heading",
  done: "setup-step-done-heading",
};

export const ADMIN_FIELD_RULES = {
  usernameMin: 3,
  usernameMax: 32,
  passwordMin: 8,
} as const;

export const ADMIN_COPY = {
  usernameHint: "Min 3 characters",
  usernameError: "Use between 3 and 32 characters.",
  passwordHint: "At least 8 characters",
  passwordError: "Use at least 8 characters.",
  emailError: "Enter a valid email address.",
} as const;

export const SLSKD_COPY = {
  testIdle: "Test connection",
  testBusy: "Testing...",
  passed: "Connection verified.",
  failed: "Could not reach slskd. Check the URL and API key.",
  failedReason: (reason: string) => `Connection failed: ${reason}`,
  overrideLink: "Continue without a verified connection",
  overrideArmed: "Continuing without a verified connection. You can fix this later in Settings.",
  saveFailed: "Could not save the slskd connection. Confirm the URL and API key, then try again.",
  blockedHint: "Test the connection before continuing",
} as const;

export const PLEX_COPY = {
  popupUnfinished: "Plex sign-in did not finish. Reopen the popup and approve access, or skip this step.",
  timeout: "Plex sign-in timed out. Try again, or skip and connect Plex later from Settings.",
  noServers: "No Plex servers were found on this account. You can skip and add one later.",
  connected: "Plex connected. Continue to the next step.",
  intro: "A popup will open for you to sign in to plex.tv.",
  connect: "Login with Plex",
  connecting: "Waiting for Plex...",
  saving: "Saving...",
  serverPickerIntro: "Pick the Plex server Synthseek should target:",
  blockedHint: "Connect Plex or skip this step to continue",
} as const;

export const ENRICHMENT_COPY = {
  saveFailed: "Could not save your settings. Check the details and try again.",
} as const;

export const ENRICHMENT_FIELD_DESCRIPTIONS = {
  lastfm: "System-wide Last.fm API key. Shared across all users.",
  fanart: "Artwork sourcing.",
  songlink:
    "Resolves track URLs across platforms for cross-platform playlist imports. Synthseek uses the public endpoint by default. Leave blank unless you have a key.",
  acoustid: "Audio fingerprinting fallback for tracks without reliable tag metadata.",
  musicbrainzEmail: "Required. Without it, Synthseek shares rate-limited email.",
} as const;

export const DONE_COPY = {
  title: "You're all set",
  description: "Synthseek is ready to go. You can adjust everything later under Settings.",
  cardHeading: "Setup complete",
  cardBody: "Slskd is wired up. Plex and metadata enrichment can be added or edited any time.",
  primaryRest: "Go to dashboard",
  primaryBusy: "Finishing...",
  primaryRetry: "Retry",
  failed: "Could not finish setup. Please try again.",
} as const;

export const SETUP_LOADING_LABEL = "Loading setup";

export const SETUP_EYEBROW = "First-run setup";
