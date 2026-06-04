"use client";

import { Download } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { primaryGradientButton } from "@theme/utilities/styles";
import { cn } from "@utils/cn";

import type { RequestArtistLidarrButtonProps } from "./types";

export function RequestArtistLidarrButton({ onRequest }: RequestArtistLidarrButtonProps) {
  const { t } = useTranslation("search");

  return (
    <Button
      onClick={onRequest}
      size="lg"
      className={cn(
        primaryGradientButton({ size: "lg", glow: "primary", hover: "lighten" }),
        "text-overlay-fg shrink-0 text-sm font-semibold"
      )}
      data-cy="content-browser-request-lidarr-btn"
    >
      <Download className="h-4 w-4 sm:mr-2" />
      <span className="hidden sm:inline">{t("browser.requestToLidarr")}</span>
    </Button>
  );
}
