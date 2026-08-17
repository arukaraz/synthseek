"use client";

import { useRef } from "react";

import { Button } from "@components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/Dialog";
import { cn } from "@utils/cn";
import { useTranslation } from "react-i18next";

import { VARIANT_ICONS } from "./constants";
import { confirmActionButton, confirmDialogContent, confirmFooter, confirmIconBadge } from "./styles";
import type { ConfirmationModalProps } from "./types";

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  variant = "danger",
  showCancel = true,
  className,
}: ConfirmationModalProps) {
  const { t } = useTranslation("components");
  const Icon = VARIANT_ICONS[variant];
  const safeActionRef = useRef<HTMLButtonElement>(null);
  const resolvedConfirmText = confirmText ?? t("confirmation.confirm", { defaultValue: "Confirm" });
  const resolvedCancelText = cancelText ?? t("confirmation.cancel", { defaultValue: "Cancel" });

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent
        showClose={false}
        className={cn(confirmDialogContent, className)}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          safeActionRef.current?.focus();
        }}
      >
        <DialogHeader className="flex-row items-start gap-4 space-y-0 text-left">
          <div className={confirmIconBadge({ variant })}>
            <Icon aria-hidden />
          </div>
          <div className="min-w-0 flex-1 space-y-1.5">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className="text-fg/65 leading-relaxed">{message}</DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className={confirmFooter}>
          {showCancel && (
            <Button ref={safeActionRef} variant="outline" size="sm" onClick={onClose} className="flex-1 sm:flex-none">
              {resolvedCancelText}
            </Button>
          )}
          <Button
            ref={showCancel ? undefined : safeActionRef}
            size="sm"
            onClick={handleConfirm}
            className={cn(confirmActionButton({ variant }), showCancel ? "flex-1 sm:flex-none" : "w-full")}
          >
            {resolvedConfirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
