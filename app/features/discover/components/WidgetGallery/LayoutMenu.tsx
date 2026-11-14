"use client";

import { ChevronDown, Plus, X } from "lucide-react";

import { Button } from "@components/ui/Button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@components/ui/DropdownMenu";

import { LayoutMenuItems } from "./LayoutMenuItems";
import { cardAction, layoutChevron } from "./styles";
import type { LayoutMenuProps } from "./types";

export function LayoutMenu({ lists, tone, label, ariaLabel, onPick }: LayoutMenuProps) {
  const Icon = tone === "add" ? Plus : X;
  const variant = tone === "add" ? "default" : "ghost";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant={variant} className={cardAction()} aria-label={ariaLabel}>
          <Icon />
          {label}
          <ChevronDown className={layoutChevron()} aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <LayoutMenuItems lists={lists} onPick={onPick} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
