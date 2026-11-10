"use client";

import { useTranslation } from "react-i18next";

import { ConfirmationModal } from "@components/ui/ConfirmationModal";

import type { DirectRequestConfirmProps } from "./types";

export function DirectRequestConfirm({ pending, onConfirm, onCancel }: DirectRequestConfirmProps) {
  const { t } = useTranslation("search");

  return (
    <ConfirmationModal
      isOpen={pending !== null}
      onClose={onCancel}
      onConfirm={onConfirm}
      variant="info"
      title={t("direct.confirm.title", { name: pending?.name ?? "" })}
      message={t("direct.confirm.message", { count: pending?.tracks.length ?? 0 })}
      confirmText={t("direct.confirm.action", { count: pending?.tracks.length ?? 0 })}
      cancelText={t("config.actions.cancel")}
    />
  );
}
