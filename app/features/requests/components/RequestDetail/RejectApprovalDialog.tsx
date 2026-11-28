"use client";

import { useEffect, useState } from "react";
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
import { InlineError } from "@components/ui/InlineError";
import { useAccessibility } from "@modules/providers/AccessibilityProvider";

import { rejectReasonInput } from "./styles";
import type { RejectApprovalDialogProps, RejectPhase } from "./types";

export function RejectApprovalDialog({
  open,
  onOpenChange,
  count,
  error,
  pending,
  onConfirm,
}: RejectApprovalDialogProps) {
  const { t } = useTranslation("requests");
  const { mode } = useAccessibility();
  const [reason, setReason] = useState("");
  const [phase, setPhase] = useState<RejectPhase>("idle");
  const [failure, setFailure] = useState<unknown>(null);

  useEffect(() => {
    if (phase === "submitted" && pending) setPhase("running");
    if (phase !== "running" || pending) return;
    setPhase("idle");
    if (error === null || error === undefined) {
      setReason("");
      onOpenChange(false);
      return;
    }
    setFailure(error);
  }, [phase, pending, error, onOpenChange]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = reason.trim();
    onConfirm(trimmed.length > 0 ? trimmed : undefined);
    if (!mode) {
      setReason("");
      onOpenChange(false);
      return;
    }
    setFailure(null);
    setPhase("submitted");
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setReason("");
      setPhase("idle");
      setFailure(null);
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>{t("approval.rejectDialog.title", { count })}</DialogTitle>
            <DialogDescription>{t("approval.rejectDialog.description", { count })}</DialogDescription>
          </DialogHeader>

          <label className="flex flex-col gap-1.5">
            <span className="text-fg/70 text-xs font-medium">{t("approval.rejectDialog.reasonLabel")}</span>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={t("approval.rejectDialog.reasonPlaceholder")}
              rows={3}
              className={rejectReasonInput()}
              aria-label={t("approval.rejectDialog.reasonLabel")}
            />
          </label>

          <InlineError error={failure} />

          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => handleOpenChange(false)}>
              {t("approval.rejectDialog.cancel")}
            </Button>
            <Button type="submit" variant="destructive" size="sm" disabled={phase !== "idle"}>
              {t("approval.rejectDialog.confirm", { count })}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
