"use client";

import { Upload } from "lucide-react";

import {
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@components/ui/DropdownMenu";
import { usePlaylistSyncTargets } from "@hooks/api";
import { PHONE_QUERY } from "@hooks/ui/constants";
import { useMediaQuery } from "@hooks/ui/useMediaQuery";

import { edgeSeparator } from "./styles";
import { SyncTargetItems } from "./SyncTargetItems";
import type { SyncToSubmenuProps } from "./types";

export function SyncToSubmenu({
  label,
  excludeServer = null,
  disabled = false,
  triggerClassName,
  onSelect,
}: SyncToSubmenuProps) {
  const { data: targets } = usePlaylistSyncTargets();
  const inline = useMediaQuery(PHONE_QUERY);
  const destinations = (targets ?? []).filter((target) => target.server !== excludeServer);

  if (destinations.length === 0) return null;

  const items = <SyncTargetItems destinations={destinations} disabled={disabled} onSelect={onSelect} />;

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
