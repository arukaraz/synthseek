"use client";

import { cn } from "@utils/cn";
import { MoreVertical } from "lucide-react";
import { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/DropdownMenu";
import { useMediaQuery } from "@hooks/ui/useMediaQuery";

import { STAGE_WIDE_QUERY } from "./constants";
import { keepMenuOpen, labelled } from "./helpers";
import { moreMenuGroups } from "./moreMenu";
import { PlayerMoreSheet } from "./PlayerMoreSheet";
import {
  iconButton,
  menuState,
  moreBadge,
  moreMenuContent,
  moreMenuIcon,
  moreTrigger,
  moreTriggerIcon,
} from "./styles";
import type { PlayerProps } from "./types";
import { useMoreAttention } from "./useMoreAttention";

export function PlayerMoreMenu({ view, actions }: PlayerProps) {
  const { t } = useTranslation("player");
  const { attention, name } = useMoreAttention(view);
  const wide = useMediaQuery(STAGE_WIDE_QUERY, true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const groups = moreMenuGroups(view, actions, t);

  const trigger = (
    <button
      type="button"
      className={cn(iconButton({ tone: attention === "remote" ? "remote" : "muted" }), moreTrigger())}
      data-player-more-toggle
      onClick={wide ? undefined : () => setSheetOpen(true)}
      {...labelled(name)}
    >
      <MoreVertical className={moreTriggerIcon()} />
      {attention === null ? null : <span className={moreBadge({ tone: attention })} />}
    </button>
  );

  if (!wide) {
    return (
      <>
        {trigger}
        {sheetOpen ? <PlayerMoreSheet title={name} groups={groups} onClose={() => setSheetOpen(false)} /> : null}
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" sideOffset={10} className={moreMenuContent()}>
        {groups.map((group, index) => (
          <Fragment key={group.key}>
            {index > 0 ? <DropdownMenuSeparator /> : null}
            {group.label ? <DropdownMenuLabel>{group.label}</DropdownMenuLabel> : null}
            {group.entries.map((entry) => {
              const Icon = entry.icon;
              const state = entry.state ? (
                <span className={menuState({ tone: entry.state.tone })}>{entry.state.text}</span>
              ) : null;
              return entry.kind === "toggle" ? (
                <DropdownMenuCheckboxItem
                  key={entry.key}
                  checked={entry.checked}
                  disabled={entry.disabled}
                  onCheckedChange={entry.onToggle}
                  onSelect={keepMenuOpen}
                >
                  <Icon className={moreMenuIcon()} />
                  {entry.label}
                  {state}
                </DropdownMenuCheckboxItem>
              ) : (
                <DropdownMenuItem
                  key={entry.key}
                  inset
                  disabled={entry.disabled}
                  onSelect={(event) => {
                    if (entry.keepOpen) keepMenuOpen(event);
                    entry.onSelect();
                  }}
                >
                  <Icon className={moreMenuIcon()} />
                  {entry.label}
                  {state}
                </DropdownMenuItem>
              );
            })}
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
