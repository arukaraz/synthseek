import type { SocialBrand } from "@components/ui/SocialIcon";
import type { ReactNode } from "react";

import type { DetailMode } from "../../types";

export interface SocialLink {
  brand: SocialBrand;
  url: string;
}

export type HeroRequestState = "request" | "requestMissing" | "inLibrary";

export interface DetailHeroProps {
  mode: DetailMode;
  name: string;
  subtitle: string | null;
  cover: string | null;
  genres: string[];
  requestState: HeroRequestState;
  socials: SocialLink[];
  statsSlot?: ReactNode;
}

export interface ShareFanProps {
  socials: SocialLink[];
}

export interface ShareFanItemStyle {
  tx: number;
  ty: number;
  openDelay: number;
  closeDelay: number;
}

export interface GenreChipsProps {
  genres: string[];
}
