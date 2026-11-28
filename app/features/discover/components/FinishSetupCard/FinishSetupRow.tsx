"use client";

import { useTranslation } from "react-i18next";

import { HashLink } from "@components/HashLink";

import { SETUP_ITEM_TARGETS } from "./constants";
import { finishMark, finishRow, finishRowAction, finishRowLabel } from "./styles";
import type { FinishSetupRowProps } from "./types";

export function FinishSetupRow({ item }: FinishSetupRowProps) {
  const { t } = useTranslation("discover");
  const target = SETUP_ITEM_TARGETS[item];

  return (
    <li>
      <HashLink href={target.href} className={finishRow()}>
        <span aria-hidden="true" className={finishMark()} />
        <span className={finishRowLabel()}>{t(target.labelKey)}</span>
        <span className={finishRowAction()}>{t("finishSetup.setUp")}</span>
      </HashLink>
    </li>
  );
}
