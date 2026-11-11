import type { ChangelogCalloutLevel } from "./types";

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const CALLOUT_ADMONITION: Record<ChangelogCalloutLevel, string> = {
  important: "IMPORTANT",
  warning: "WARNING",
  note: "NOTE",
};

export const DOCUMENT_TITLE = "# Patch Notes";

export const SECTION_SEPARATOR = "---";

export const WHATS_NEW_MAX_HIGHLIGHTS = 4;

export const WHATS_NEW_IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "gif"];

export const WHATS_NEW_VIDEO_EXTENSIONS = ["mp4", "webm"];

export const WHATS_NEW_MEDIA_DIR = "changelog-media";

export const BARE_VERSION_MESSAGE = "A version must be three dot-separated numbers without a prefix, such as 3.1.0";

const MEDIA_NAME_RULE = "a lowercase name of letters, digits and hyphens ending in";

export const IMAGE_FILE_MESSAGE = `A highlight image or poster must be ${MEDIA_NAME_RULE} .${WHATS_NEW_IMAGE_EXTENSIONS.join(", .")}`;

export const VIDEO_FILE_MESSAGE = `A highlight video must be ${MEDIA_NAME_RULE} .${WHATS_NEW_VIDEO_EXTENSIONS.join(", .")}`;
