"use client";

import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";

import { diskBanner, diskText } from "../styles";
import type { DiskNoticeProps } from "../types";

export function DiskNotice({ onReload, onKeep }: DiskNoticeProps) {
  const { t } = useTranslation("themeEditor");
  return (
    <div role="status" className={diskBanner()}>
      <span className={diskText()}>{t("css.diskChanged")}</span>
      <Button type="button" size="sm" variant="secondary" onClick={onReload}>
        {t("css.reload")}
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={onKeep}>
        {t("css.keepMine")}
      </Button>
    </div>
  );
}
