"use client";

import { Accessibility } from "lucide-react";
import { useTranslation } from "react-i18next";

import { AccessibilityControls } from "@components/AccessibilityControls";
import { Button } from "@components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/Dialog";

import { panelContent } from "./styles";

export function AccessibilityPanel() {
  const { t } = useTranslation("components");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Accessibility />
          {t("accessibilityPanel.open")}
        </Button>
      </DialogTrigger>
      <DialogContent className={panelContent()}>
        <DialogHeader>
          <DialogTitle>{t("accessibilityPanel.title")}</DialogTitle>
          <DialogDescription>{t("accessibilityPanel.description")}</DialogDescription>
        </DialogHeader>
        <AccessibilityControls scope="guest" />
      </DialogContent>
    </Dialog>
  );
}
