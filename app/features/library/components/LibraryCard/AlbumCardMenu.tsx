"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/DropdownMenu";
import { CirclePlus, MoreVertical } from "lucide-react";
import { useTranslation } from "react-i18next";

import { albumFileTarget } from "../../helpers";
import { libraryMenuItem } from "../../styles";
import { FileActionMenuItems } from "../LibraryFileFlow";
import { cardCoverAction } from "./styles";
import type { AlbumCardMenuProps } from "./types";

export function AlbumCardMenu({ item, onEnqueue, fileActions }: AlbumCardMenuProps) {
  const { t } = useTranslation("library");

  return (
    <div onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cardCoverAction()}
          aria-label={t("page.actions.albumMenu", { name: item.name })}
        >
          <MoreVertical className="size-5" aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className={libraryMenuItem()} onSelect={onEnqueue}>
            <CirclePlus className="size-4" aria-hidden />
            {t("page.actions.addToQueue")}
          </DropdownMenuItem>
          <FileActionMenuItems target={albumFileTarget(item)} actions={fileActions} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
