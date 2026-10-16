"use client";

import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/Dialog";

import { leaveDialogContent, leaveDialogFooter } from "./styles";
import type { LeaveChangesDialogProps } from "./types";

export function LeaveChangesDialog({ open, busy, saveDisabled, onStay, onDiscard, onSave }: LeaveChangesDialogProps) {
  const { t } = useTranslation("settings");

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onStay();
      }}
    >
      <DialogContent showClose={false} className={leaveDialogContent()}>
        <DialogHeader>
          <DialogTitle>{t("shell.leaveDialog.title")}</DialogTitle>
          <DialogDescription>{t("shell.leaveDialog.description")}</DialogDescription>
        </DialogHeader>
        <DialogFooter className={leaveDialogFooter()}>
          <Button variant="ghost" size="sm" onClick={onStay} disabled={busy}>
            {t("shell.leaveDialog.stay")}
          </Button>
          <Button variant="outline" size="sm" onClick={onDiscard} disabled={busy}>
            {t("shell.leaveDialog.discard")}
          </Button>
          <Button size="sm" onClick={onSave} disabled={busy || saveDisabled}>
            {busy ? t("shell.saveBar.saving") : t("shell.leaveDialog.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
