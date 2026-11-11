"use client";

import { useTranslation } from "react-i18next";

import { segmentState } from "./helpers";
import { progress, segment } from "./styles";
import type { CardProgressProps } from "./types";

export function CardProgress({ total, current, onSelect }: CardProgressProps) {
  const { t } = useTranslation("settings");

  return (
    <div className={progress()}>
      {Array.from({ length: total }, (_, index) => (
        <button
          key={index}
          type="button"
          className={segment({ state: segmentState(index, current) })}
          aria-current={index === current ? "step" : undefined}
          aria-label={t("updates.whatsNew.goTo", { current: index + 1, total })}
          onClick={() => onSelect(index)}
        />
      ))}
    </div>
  );
}
