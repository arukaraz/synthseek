"use client";

import { Download, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";

import { toolbarActions } from "../styles";
import type { MembersToolbarProps } from "../types";

export function MembersToolbar({ onCreate, onImport }: MembersToolbarProps) {
  const { t } = useTranslation("settings");

  return (
    <div className={toolbarActions()}>
      <Button size="sm" onClick={onCreate}>
        <UserPlus />
        {t("members.toolbar.createLocal")}
      </Button>
      <Button size="sm" variant="secondary" onClick={onImport}>
        <Download />
        {t("members.toolbar.importPlex")}
      </Button>
    </div>
  );
}
