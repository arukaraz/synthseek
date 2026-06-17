import { cn } from "@utils/cn";
import { Globe } from "lucide-react";

import { SOCIAL_BRAND_CLASS, SOCIAL_BRAND_PATHS } from "./constants";
import type { SocialIconProps } from "./types";

export function SocialIcon({ brand, className, ...props }: SocialIconProps) {
  if (brand === "website") {
    return <Globe className={cn(SOCIAL_BRAND_CLASS.website, className)} aria-hidden {...props} />;
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn(SOCIAL_BRAND_CLASS[brand], className)}
      aria-hidden
      {...props}
    >
      <path d={SOCIAL_BRAND_PATHS[brand]} />
    </svg>
  );
}
