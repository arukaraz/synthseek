"use client";

import { UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";

import { emptyBlock, hintText, statusBox } from "../styles";
import type { CalendarEmptyProps } from "./types";

export function CalendarEmpty({ onFollowMostPlayed }: CalendarEmptyProps) {
  const { t } = useTranslation("follows");

  return (
    <div className={statusBox()}>
      <div className={emptyBlock()}>
        <h3 className="text-fg text-base font-semibold">{t("releases.emptyTitle")}</h3>
        <p className={hintText()}>{t("releases.emptyBody")}</p>
        <Button variant="secondary" onClick={onFollowMostPlayed}>
          <UserPlus aria-hidden />
          {t("following.followMostPlayed")}
        </Button>
      </div>
    </div>
  );
}
