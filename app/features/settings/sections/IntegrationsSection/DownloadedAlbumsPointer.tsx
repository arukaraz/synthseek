"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

import { Notice } from "@components/ui/Notice";

import { DOWNLOADED_ALBUMS_HREF } from "./constants";
import { downloadedAlbumsLink } from "./styles";

export function DownloadedAlbumsPointer() {
  const { t } = useTranslation("settings");

  return (
    <Notice variant="info" title={t("downloadedAlbumsPointer.text")}>
      <Link href={DOWNLOADED_ALBUMS_HREF} className={downloadedAlbumsLink()}>
        {t("downloadedAlbumsPointer.link")}
      </Link>
    </Notice>
  );
}
