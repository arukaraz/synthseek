"use client";

import { Upload } from "lucide-react";

import { ProviderMark, providerTone } from "@components/LibrarySourceModal";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@components/ui/DropdownMenu";
import { usePlaylistSyncTargets } from "@hooks/api";
import { useMediaQuery } from "@hooks/ui/useMediaQuery";
import { cn } from "@utils/cn";

import { INLINE_TARGETS_QUERY } from "./constants";
import { edgeSeparator, syncTargetChip, syncTargetItem } from "./styles";
import type { SyncToSubmenuProps } from "./types";

export function SyncToSubmenu({
  label,
  excludeServer = null,
  disabled = false,
  triggerClassName,
  onSelect,
}: SyncToSubmenuProps) {
  const { data: targets } = usePlaylistSyncTargets();
  const inline = useMediaQuery(INLINE_TARGETS_QUERY);
  const destinations = (targets ?? []).filter((target) => target.server !== excludeServer);

  if (destinations.length === 0) return null;

  const items = destinations.map((target) => (
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

  if (inline) {
    return (
      <>
        <DropdownMenuSeparator className={edgeSeparator()} />
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        {items}
        <DropdownMenuSeparator className={edgeSeparator()} />
      </>
    );
  }

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger disabled={disabled} className={triggerClassName}>
        <Upload className="size-3.5" />
        {label}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="min-w-48">{items}</DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
