"use client";

import { useTranslation } from "react-i18next";

import { Notice } from "@components/ui/Notice";

import { MOVE_CLASSES } from "./constants";
import { infoBody, infoEntry, infoExample, infoList, infoNote, infoTerm, infoText } from "./styles";

export function PreviewInfo() {
  const { t } = useTranslation("settings");

  return (
    <Notice variant="info" title={t("libraryNaming.preview.info.title")}>
      <div className={infoBody()}>
        <p className={infoText()}>{t("libraryNaming.preview.info.counts")}</p>
        <p className={infoText()}>{t("libraryNaming.preview.info.lists")}</p>
        <div className={infoList()}>
          {MOVE_CLASSES.map((moveClass) => (
            <div key={moveClass} className={infoEntry()}>
              <span className={infoTerm()}>{t(`libraryNaming.preview.info.${moveClass}Term`)}</span>
              <span className={infoText()}>{t(`libraryNaming.preview.info.${moveClass}Text`)}</span>
              <span className={infoExample()}>{t(`libraryNaming.preview.info.${moveClass}Example`)}</span>
            </div>
          ))}
        </div>
        <p className={infoNote()}>{t("libraryNaming.preview.info.buttonScope")}</p>
      </div>
    </Notice>
  );
}
