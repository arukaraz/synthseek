"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Dialog, DialogClose, DialogOverlay, DialogPortal, DialogSurface, DialogTitle } from "@components/ui/Dialog";
import { modalContent } from "@utils/animations";

import { SETTINGS_TOGGLE_SELECTOR } from "./constants";
import { labelled, returnFocusTo } from "./helpers";
import { SettingsSections } from "./SettingsSections";
import {
  iconButton,
  queueHeader,
  queueTitle,
  settingsModal,
  settingsModalBody,
  settingsModalFrame,
  settingsModalOverlay,
} from "./styles";
import type { PlayerSettingsSectionProps } from "./types";

export function SettingsModal({ view, actions }: PlayerSettingsSectionProps) {
  const { t } = useTranslation("player");

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) actions.toggleSettings();
      }}
    >
      <DialogPortal>
        <DialogOverlay className={settingsModalOverlay()} />
      </DialogPortal>
      <DialogSurface
        className={settingsModal()}
        aria-describedby={undefined}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusTo(SETTINGS_TOGGLE_SELECTOR);
        }}
      >
        <motion.div
          className={settingsModalFrame()}
          variants={modalContent}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className={queueHeader()}>
            <DialogTitle asChild>
              <span className={queueTitle()}>{t("settings.title")}</span>
            </DialogTitle>
            <DialogClose asChild>
              <button type="button" className={iconButton()} {...labelled(t("settings.close"))}>
                <X className="size-4" />
              </button>
            </DialogClose>
          </div>
          <div className={settingsModalBody()}>
            <SettingsSections view={view} actions={actions} />
          </div>
        </motion.div>
      </DialogSurface>
    </Dialog>
  );
}
