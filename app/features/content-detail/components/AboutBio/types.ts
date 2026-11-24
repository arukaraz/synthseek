import type { BadgeSource } from "@components/SourceBadge";

export interface AboutBioSource {
  source: BadgeSource;
  label: string;
  href: string;
}

export interface AboutBioProps {
  text: string | null;
  clamped?: boolean;
  source?: AboutBioSource;
}
