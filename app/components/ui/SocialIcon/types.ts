import type { SVGProps } from "react";

export type SocialBrand = "spotify" | "appleMusic" | "youtube" | "instagram" | "website";

export interface SocialIconProps extends Omit<SVGProps<SVGSVGElement>, "viewBox" | "fill"> {
  brand: SocialBrand;
}
