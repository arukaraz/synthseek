"use client";

import { Dialog, DialogDescription, DialogSurface, DialogTitle } from "@components/ui/Dialog";
import { usePlayerBottomDock, usePlayerDock } from "@hooks/ui/player";
import { setChromeCollapsed } from "@hooks/ui/useChromeCollapsed";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { ESCAPE_REVERTS_SELECTOR } from "./constants";
import { workshopSurface } from "./styles";
import type { WorkshopSurfaceProps } from "./types";

export function WorkshopSurface({ open, name, onExit, children }: WorkshopSurfaceProps) {
  const { t } = useTranslation("contentDetail");
  const bottomDock = usePlayerBottomDock();
  const dock = usePlayerDock();

  useEffect(() => {
    if (open) setChromeCollapsed(false);
  }, [open]);

  return (
    <Dialog
      open={open}
      modal={false}
      onOpenChange={(next) => {
        if (!next) onExit();
      }}
    >
      <DialogSurface
        className={workshopSurface({ dock: bottomDock, chain: dock === "chain" })}
        aria-describedby="playlist-workshop-description"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => {
          if (event.target instanceof Element && event.target.closest(ESCAPE_REVERTS_SELECTOR) !== null) {
            event.preventDefault();
          }
        }}
        onOpenAutoFocus={(event) => event.preventDefault()}
        data-cy="playlist-workshop"
      >
        <DialogTitle className="sr-only">{t("workshop.dialogTitle", { name })}</DialogTitle>
        <DialogDescription id="playlist-workshop-description" className="sr-only">
          {t("workshop.dialogDescription", { name })}
        </DialogDescription>
        {children}
      </DialogSurface>
    </Dialog>
  );
}
