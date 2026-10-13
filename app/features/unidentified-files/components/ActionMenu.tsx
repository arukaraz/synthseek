"use client";

import { MoreHorizontal } from "lucide-react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/DropdownMenu";

import { menuContent, menuItem, menuItemHelp, menuItemText, menuTrigger } from "../styles";
import type { ActionMenuProps } from "../types";

export function ActionMenu({ label, items, disabled = false }: ActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={menuTrigger()} aria-label={label} disabled={disabled}>
          <MoreHorizontal aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={menuContent()}>
        {items.map(({ key, icon: Icon, label: itemLabel, help, onSelect }) => (
          <DropdownMenuItem key={key} className={menuItem()} onSelect={onSelect}>
            <Icon aria-hidden />
            <span className={menuItemText()}>
              <span>{itemLabel}</span>
              {help ? <span className={menuItemHelp()}>{help}</span> : null}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
