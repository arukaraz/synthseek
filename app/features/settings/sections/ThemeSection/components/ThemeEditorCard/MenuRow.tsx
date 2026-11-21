"use client";

import { useTranslation } from "react-i18next";

import { InfoTooltip } from "@components/ui/InfoTooltip";
import { useMediaQuery } from "@hooks/ui/useMediaQuery";

import { TOUCH_QUERY } from "./constants";
import { menuRow, menuRowControl, menuRowLabel } from "./styles";
import type { MenuRowProps } from "./types";

export function MenuRow({ label, tip, children }: MenuRowProps) {
  const { t } = useTranslation("themeEditor");
  const touch = useMediaQuery(TOUCH_QUERY);

  return (
    <div className={menuRow()}>
      <span className={menuRowLabel()}>
        {label}
        <InfoTooltip
          description={tip}
          triggerLabel={t("editor.about", { name: label })}
          trigger={touch ? "click" : "hover"}
          side="bottom"
        />
      </span>
      <div className={menuRowControl()}>{children}</div>
    </div>
  );
}
