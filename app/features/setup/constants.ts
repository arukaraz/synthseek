import { z } from "zod";

import type { UrlParamConfig } from "@hooks/ui/useUrlParam";
import { isPlaybackServerKey, PLAYBACK_SERVER_NAMES } from "@utils/playback-servers";

import type { AccountDraft, MediaServerChoice, SetupStepId } from "./types";

export const SETUP_STEPS: readonly SetupStepId[] = ["account", "media", "downloads", "metadata", "summary"];

export const QUESTION_COUNT = 4;

export const MEDIA_SERVERS: readonly MediaServerChoice[] =
  Object.keys(PLAYBACK_SERVER_NAMES).filter(isPlaybackServerKey);

export const NO_MEDIA_SERVER = "none";

export const SETUP_URL_SCHEMA = {
  question: { validValues: SETUP_STEPS } satisfies UrlParamConfig<SetupStepId>,
  server: { validValues: MEDIA_SERVERS } satisfies UrlParamConfig<MediaServerChoice>,
};

export const EMAIL_SCHEMA = z.email();

export const EMPTY_ACCOUNT_DRAFT: AccountDraft = { email: "", username: "", password: "", token: "" };

export const ACCOUNT_FIELD_ORDER: readonly (keyof AccountDraft)[] = ["token", "email", "username", "password"];

export const DEFAULT_RETRY_AFTER_SECONDS = 60;

export const SENTENCE_ENDINGS: readonly string[] = [".", "!", "?", "…"];

export const MS_PER_SECOND = 1000;
