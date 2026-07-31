"use client";

import { BadgeCheck, ShieldCheck, Trash2, User as UserIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { Role } from "@api/__generated__/types";

import { bulkBar, bulkCount, bulkSpacer } from "../styles";
import type { BulkEditBarProps } from "../types";

export function BulkEditBar({ count, isPending, onSetRole, onDelete, onClear }: BulkEditBarProps) {
  const { t } = useTranslation("settings");

  return (
    <div className={bulkBar()}>
      <span className={bulkCount()}>{t("members.bulk.selected", { count })}</span>
      <Button size="sm" variant="outline" onClick={() => onSetRole(Role.enum.member)} disabled={isPending}>
        <UserIcon />
        {t("members.bulk.makeUser")}
      </Button>
      <Button size="sm" variant="outline" onClick={() => onSetRole(Role.enum.trusted)} disabled={isPending}>
        <BadgeCheck />
        {t("members.bulk.makeTrusted")}
      </Button>
      <Button size="sm" variant="outline" onClick={() => onSetRole(Role.enum.admin)} disabled={isPending}>
        <ShieldCheck />
        {t("members.bulk.makeAdmin")}
      </Button>
      <div className={bulkSpacer()} />
      <Button size="sm" variant="destructive" onClick={onDelete} disabled={isPending}>
        <Trash2 />
        {t("members.bulk.delete")}
      </Button>
      <Button size="sm" variant="ghost" onClick={onClear} disabled={isPending}>
        {t("members.bulk.clear")}
      </Button>
    </div>
  );
}
