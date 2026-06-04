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
