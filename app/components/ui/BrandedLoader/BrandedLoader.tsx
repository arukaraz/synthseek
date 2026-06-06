import { AppLogo } from "@components/ui/AppLogo";
import { Spinner } from "@components/ui/Spinner";
import { cn } from "@utils/cn";

import {
  brandedLoaderGrid,
  brandedLoaderLabel,
  brandedLoaderMark,
  brandedLoaderOrb,
  brandedLoaderRoot,
} from "./styles";
import type { BrandedLoaderProps } from "./types";

export function BrandedLoader({ label = "Loading", className }: BrandedLoaderProps) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={cn(brandedLoaderRoot(), className)}>
      <div aria-hidden="true" className={brandedLoaderGrid()} />
      <div aria-hidden="true" className={brandedLoaderOrb()} />

      <div className={brandedLoaderMark()}>
        <Spinner size="fill" decorative />
        <AppLogo iconClassName="h-11 w-auto sm:h-12" wordmarkClassName="sr-only" />
      </div>

      <p className={brandedLoaderLabel()}>{label}</p>
    </div>
  );
}
