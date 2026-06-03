import { cn } from "@utils/cn";

import { LogoIcon } from "../LogoIcon";
import type { AppLogoProps } from "./types";

export function AppLogo({ className, iconClassName, wordmarkClassName }: AppLogoProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <LogoIcon className={iconClassName} />
      <span
        className={cn(
          "gradient-text-primary font-courgette ml-px text-2xl leading-none sm:text-3xl",
          wordmarkClassName
        )}
      >
        ynthseek
      </span>
    </div>
  );
}
