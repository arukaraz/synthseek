"use client";

import { UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";

import { emptyBlock, hintText, statusBox } from "../styles";
import type { CalendarEmptyProps } from "./types";

export function FollowingEmpty({ onFollowMostPlayed }: CalendarEmptyProps) {
  const { t } = useTranslation("follows");

  return (
    <div className={statusBox()}>
      <div className={emptyBlock()}>
        <h3 className="text-fg text-base font-semibold">{t("following.emptyTitle")}</h3>
        <p className={hintText()}>{t("following.emptyBody")}</p>
        <Button onClick={onFollowMostPlayed}>
          <UserPlus aria-hidden />
          {t("following.followMostPlayed")}
        </Button>
        <p className={hintText()}>{t("following.emptyHint")}</p>
      </div>
    </div>
  );
}
