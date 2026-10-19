"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Fragment } from "react";

import { FadeScroll } from "@components/FadeScroll";
import { Dialog, DialogSurface, DialogTitle } from "@components/ui/Dialog";
import { playerPanel } from "@utils/animations";

import { MORE_TOGGLE_SELECTOR } from "./constants";
import { returnFocusTo } from "./helpers";
import {
  menuState,
  moreMenuIcon,
  moreSheetBody,
  moreSheetCheck,
  moreSheetLabel,
  moreSheetList,
  moreSheetRow,
  moreSheetSeparator,
  moreSheetTitle,
  panelAnchor,
  panelSurface,
} from "./styles";
import type { PlayerMoreSheetProps } from "./types";

export function PlayerMoreSheet({ title, groups, onClose }: PlayerMoreSheetProps) {
  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogSurface
        className={panelAnchor({ width: "devices" })}
        aria-describedby={undefined}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusTo(MORE_TOGGLE_SELECTOR);
        }}
      >
        <motion.div className={panelSurface({ edge: "bar" })} variants={playerPanel} initial="hidden" animate="visible">
          <DialogTitle asChild>
            <span className={moreSheetTitle()}>{title}</span>
          </DialogTitle>
          <FadeScroll className={moreSheetBody()}>
            <div className={moreSheetList()} role="menu" aria-label={title}>
              {groups.map((group, index) => (
                <Fragment key={group.key}>
                  {index > 0 ? <div className={moreSheetSeparator()} role="separator" /> : null}
                  {group.label ? <span className={moreSheetLabel()}>{group.label}</span> : null}
                  {group.entries.map((entry) => {
                    const Icon = entry.icon;
                    const state = entry.state ? (
                      <span className={menuState({ tone: entry.state.tone })}>{entry.state.text}</span>
                    ) : null;
                    return entry.kind === "toggle" ? (
                      <button
                        key={entry.key}
                        type="button"
                        role="menuitemcheckbox"
                        aria-checked={entry.checked}
                        className={moreSheetRow()}
                        disabled={entry.disabled}
                        onClick={entry.onToggle}
                      >
                        <Icon className={moreMenuIcon()} />
                        {entry.label}
                        {state}
                        <Check className={moreSheetCheck({ checked: entry.checked })} aria-hidden />
                      </button>
                    ) : (
                      <button
                        key={entry.key}
                        type="button"
                        role="menuitem"
                        className={moreSheetRow()}
                        disabled={entry.disabled}
                        onClick={() => {
                          if (!entry.keepOpen) onClose();
                          entry.onSelect();
                        }}
                      >
                        <Icon className={moreMenuIcon()} />
                        {entry.label}
                        {state}
                      </button>
                    );
                  })}
                </Fragment>
              ))}
            </div>
          </FadeScroll>
        </motion.div>
      </DialogSurface>
    </Dialog>
  );
}
