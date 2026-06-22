import type { SocialBrand } from "@components/ui/SocialIcon";
import type { CSSProperties } from "react";

import {
  SHARE_FAN_ARC_END_DEG,
  SHARE_FAN_ARC_START_DEG,
  SHARE_FAN_RADIUS,
  SHARE_FAN_STAGGER_MS,
  SOCIAL_BASE_URL,
} from "./constants";
import type { HeroRequestState, ShareFanItemStyle, SocialLink } from "./types";

export function heroPillVisibility({
  requestState,
  showRequest,
  showInLibraryPill,
}: {
  requestState: HeroRequestState;
  showRequest: boolean;
  showInLibraryPill: boolean;
}): { showInLibrary: boolean; showRequestButton: boolean; showActions: boolean } {
  const showInLibrary = requestState === "inLibrary" && showInLibraryPill;
  const showRequestButton = showRequest && requestState !== "inLibrary";
  const showActions = showRequest && (showInLibrary || showRequestButton);
  return { showInLibrary, showRequestButton, showActions };
}

interface ArtistSocials {
  instagram: string | null;
  youtube: string | null;
  appleMusic: string | null;
  spotify: string | null;
}

type SocialKey = keyof typeof SOCIAL_BASE_URL;

const SOCIAL_ORDER: { brand: SocialBrand; key: SocialKey }[] = [
  { brand: "instagram", key: "instagram" },
  { brand: "youtube", key: "youtube" },
  { brand: "appleMusic", key: "appleMusic" },
  { brand: "spotify", key: "spotify" },
];

function socialHref(key: SocialKey, value: string): string {
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `${SOCIAL_BASE_URL[key]}${value}`;
}

export const SOCIAL_BRAND_VAR: Record<SocialBrand, string> = {
  instagram: "var(--brand-instagram)",
  youtube: "var(--brand-youtube)",
  appleMusic: "var(--brand-apple-music)",
  spotify: "var(--brand-spotify)",
  website: "var(--brand-website)",
};

export function buildSocialLinks(socials: ArtistSocials | null | undefined): SocialLink[] {
  if (!socials) return [];
  const links: SocialLink[] = [];
  for (const { brand, key } of SOCIAL_ORDER) {
    const value = socials[key];
    if (value) links.push({ brand, url: socialHref(key, value) });
  }
  return links;
}

export function shareFanItemStyle(index: number, total: number): ShareFanItemStyle {
  const step = total > 1 ? (SHARE_FAN_ARC_END_DEG - SHARE_FAN_ARC_START_DEG) / (total - 1) : 0;
  const angleDeg = SHARE_FAN_ARC_START_DEG + step * index;
  const angleRad = (angleDeg * Math.PI) / 180;
  const tx = Math.cos(angleRad) * SHARE_FAN_RADIUS;
  const ty = -Math.sin(angleRad) * SHARE_FAN_RADIUS;
  return {
    tx: Math.round(tx),
    ty: Math.round(ty),
    openDelay: index * SHARE_FAN_STAGGER_MS,
    closeDelay: (total - 1 - index) * SHARE_FAN_STAGGER_MS,
  };
}

export function shareFanItemCss(item: ShareFanItemStyle, open: boolean): CSSProperties {
  if (open) {
    return {
      "--share-tx": `${item.tx}px`,
      "--share-ty": `${item.ty}px`,
      "--share-delay": `${item.openDelay}ms`,
    } as CSSProperties;
  }
  return { "--share-delay": `${item.closeDelay}ms` } as CSSProperties;
}
