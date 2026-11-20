"use client";

import { ProviderMark, providerTone } from "@components/LibrarySourceModal";
import { DropdownMenuItem } from "@components/ui/DropdownMenu";
import { cn } from "@utils/cn";

import { syncTargetChip, syncTargetItem } from "./styles";
import type { SyncTargetItemsProps } from "./types";

export function SyncTargetItems({ destinations, disabled = false, onSelect }: SyncTargetItemsProps) {
  return destinations.map((target) => (
    <DropdownMenuItem
      key={target.server}
      disabled={disabled}
      onSelect={() => onSelect(target.server)}
      className={syncTargetItem()}
    >
      <span className={cn(syncTargetChip(), providerTone({ provider: target.server }))}>
        <ProviderMark provider={target.server} />
      </span>
      <span className="flex-1">{target.name}</span>
    </DropdownMenuItem>
  ));
}
