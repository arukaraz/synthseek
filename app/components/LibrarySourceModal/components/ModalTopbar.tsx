"use client";

import { cn } from "@utils/cn";

import { brandChip, brandIcon, providerTone, topbar } from "../styles";
import { ProviderMark } from "./ProviderMark";
import type { ModalTopbarProps } from "./types";

export function ModalTopbar({ provider, name }: ModalTopbarProps) {
  return (
    <div className={topbar()}>
      <span className={brandChip()}>
        <span className={cn(brandIcon(), providerTone({ provider }))}>
          <ProviderMark provider={provider} />
        </span>
        {name}
      </span>
    </div>
  );
}
