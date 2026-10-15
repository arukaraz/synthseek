"use client";

import { DropdownMenuItem, DropdownMenuSeparator } from "@components/ui/DropdownMenu";
import { useAuthContext } from "@modules/providers/AuthProvider";
import { FolderInput, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { libraryMenuItem, libraryMenuItemDanger } from "../../styles";
import type { FileActionMenuItemsProps } from "./types";

export function FileActionMenuItems({ target, actions }: FileActionMenuItemsProps) {
  const { t } = useTranslation("library");
  const { isAdmin } = useAuthContext();

  if (!isAdmin) return null;

  const inLibrary = target.pathIds.length > 0;

  return (
    <>
      <DropdownMenuSeparator />
      {actions.canMove ? (
        <DropdownMenuItem className={libraryMenuItem()} disabled={!inLibrary} onSelect={() => actions.openMove(target)}>
          <FolderInput className="size-4" aria-hidden />
          {t("page.actions.moveToPath")}
        </DropdownMenuItem>
      ) : null}
      <DropdownMenuItem
        className={libraryMenuItemDanger()}
        disabled={!inLibrary}
        onSelect={() => actions.openDelete(target)}
      >
        <Trash2 className="size-4" aria-hidden />
        {target.scope === "track" ? t("page.actions.deleteFile") : t("page.actions.deleteFiles")}
      </DropdownMenuItem>
    </>
  );
}
