"use client";

import { cn } from "@utils/cn";
import { useId } from "react";
import { useTranslation } from "react-i18next";

import { LOGO_BODY_PATH, LOGO_GRADIENT_TRANSFORM, LOGO_HEIGHT, LOGO_HOLE_PATHS, LOGO_VIEW_BOX } from "./constants";
import type { LogoIconProps } from "./types";

export function LogoIcon({ className }: LogoIconProps) {
  const { t } = useTranslation("components");
  const id = useId();
  const gradientId = `${id}gradient`;
  const maskId = `${id}mask`;
  return (
    <svg
      viewBox={LOGO_VIEW_BOX}
      className={cn("h-12 w-auto", className)}
      aria-label={t("logo.ariaLabel", { defaultValue: "Synthseek Logo" })}
    >
      <defs>
        <linearGradient
          id={gradientId}
          x2="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform={LOGO_GRADIENT_TRANSFORM}
        >
          <stop offset="0" className="[stop-color:var(--color-secondary-500)]" />
          <stop offset="1" className="[stop-color:var(--color-accent-500)]" />
        </linearGradient>
        <mask id={maskId}>
          <path fill="white" d={LOGO_BODY_PATH} />
          {LOGO_HOLE_PATHS.map((hole) => (
            <path key={hole} fill="black" d={hole} />
          ))}
        </mask>
      </defs>
      <rect x="0" y="0" width="156" height={LOGO_HEIGHT} fill={`url(#${gradientId})`} mask={`url(#${maskId})`} />
    </svg>
  );
}
