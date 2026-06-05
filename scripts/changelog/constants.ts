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
