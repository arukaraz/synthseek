"use client";

import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

import { DialogDescription, DialogTitle } from "@components/ui/Dialog";
import { IconButton } from "@components/ui/IconButton";

import { panelHeader, panelHeaderText, panelPath } from "../styles";
import type { StepHeaderProps } from "../types";

export function StepHeader({ title, description, onBack }: StepHeaderProps) {
  const { t } = useTranslation("settings");

  return (
    <div className={panelHeader()}>
      <IconButton icon={ArrowLeft} size="sm" aria-label={t("libraryScan.review.match.back")} onClick={onBack} />
      <div className={panelHeaderText()}>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription className={panelPath()}>{description}</DialogDescription>
      </div>
    </div>
  );
}
