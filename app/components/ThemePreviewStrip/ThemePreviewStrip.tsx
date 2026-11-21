"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { useThemeContext } from "@theme/ThemeProvider";

import { EDITOR_RETURN_HREF } from "./constants";
import { previewStrip, previewStripText, previewStripTitle } from "./styles";

export function ThemePreviewStrip() {
  const { t } = useTranslation("themeEditor");
  const router = useRouter();
  const { previewing, stopPreview } = useThemeContext();

  if (!previewing) return null;

  const goBack = () => {
    stopPreview();
    router.push(EDITOR_RETURN_HREF);
  };

  return (
    <div className={previewStrip()} role="status">
      <p className={previewStripText()}>
        <strong className={previewStripTitle()}>{t("preview.title")}</strong> {t("preview.message")}
      </p>
      <Button size="sm" onClick={goBack}>
        {t("preview.back")}
      </Button>
    </div>
  );
}
