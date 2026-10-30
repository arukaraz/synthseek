"use client";

import { useTranslation } from "react-i18next";

import { ConfirmationModal } from "@components/ui/ConfirmationModal";

import type { DeleteWidgetDialogProps } from "./types";

export function DeleteWidgetDialog({ widget, tiles, onCancel, onConfirm }: DeleteWidgetDialogProps) {
  const { t } = useTranslation("widgets");
  const name = widget?.meta.name ?? "";

  return (
    <ConfirmationModal
      isOpen={widget !== null}
      onClose={onCancel}
      onConfirm={() => {
        if (widget) onConfirm(widget);
      }}
      title={t("mine.deleteTitle", { name })}
      message={tiles > 0 ? t("mine.deleteWithTiles", { count: tiles }) : t("mine.deleteMessage")}
      confirmText={t("mine.delete")}
      cancelText={t("workshop.cancel")}
      variant="danger"
    />
  );
}
