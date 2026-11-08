"use client";

import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { DialogClose, DialogDescription, DialogTitle } from "../Dialog";
import {
  bottomSheetClose,
  bottomSheetHeader,
  bottomSheetHeaderText,
  bottomSheetSubtitle,
  bottomSheetTitle,
} from "./styles";
import type { BottomSheetHeaderProps } from "./types";

export function BottomSheetHeader({ title, subtitle }: BottomSheetHeaderProps) {
  const { t } = useTranslation("components");

  return (
    <div className={bottomSheetHeader()}>
      <div className={bottomSheetHeaderText()}>
        <DialogTitle className={bottomSheetTitle()}>{title}</DialogTitle>
        {subtitle ? (
          <DialogDescription className={bottomSheetSubtitle()}>{subtitle}</DialogDescription>
        ) : (
          <DialogDescription className="sr-only">{title}</DialogDescription>
        )}
      </div>
      <DialogClose className={bottomSheetClose()} aria-label={t("dialog.close", { defaultValue: "Close" })}>
        <X className="size-4" />
      </DialogClose>
    </div>
  );
}
