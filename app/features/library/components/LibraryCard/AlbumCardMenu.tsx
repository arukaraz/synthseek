"use client";

import { useAuthContext } from "@modules/providers/AuthProvider";
import { CirclePlus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { albumFileTarget } from "../../helpers";
import { LibraryActionMenu } from "../LibraryActionMenu";
import { fileMenuActions } from "../LibraryFileFlow";
import { cardInlineKebab } from "./styles";
import type { AlbumCardMenuProps } from "./types";

export function AlbumCardMenu({ item, onEnqueue, fileActions }: AlbumCardMenuProps) {
  const { t } = useTranslation("library");
  const { isAdmin } = useAuthContext();

  return (
    <LibraryActionMenu
      title={item.name}
      subtitle={item.artist}
      triggerLabel={t("page.actions.albumMenu", { name: item.name })}
      triggerClassName={cardInlineKebab()}
      iconClassName="size-4"
      actions={[
        { key: "queue", icon: CirclePlus, label: t("page.actions.addToQueue"), onSelect: onEnqueue },
        ...fileMenuActions(albumFileTarget(item), fileActions, isAdmin),
      ]}
    />
  );
}
