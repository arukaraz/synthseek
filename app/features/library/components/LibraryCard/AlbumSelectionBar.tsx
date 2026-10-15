"use client";

import { BulkActionBar, type BulkAction } from "@components/ui/BulkActionBar";
import { useAuthContext } from "@modules/providers/AuthProvider";
import { CheckCheck, CirclePlus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { selectedAlbumsFileTarget } from "../../helpers";
import { fileBulkActions } from "../LibraryFileFlow";
import type { AlbumSelectionBarProps } from "./types";

export function AlbumSelectionBar({ items, selection, fileActions, onEnqueue }: AlbumSelectionBarProps) {
  const { t } = useTranslation("library");
  const { isAdmin } = useAuthContext();

  if (selection.selectedCount === 0) return null;

  const chosen = items.filter((item) => selection.isSelected(item.id));
  const inLibraryIds = selection.selectors.filterSelected(items, (item) => item.libraryPaths.length > 0);

  const actions: BulkAction[] = [];
  if (!selection.selectors.allSelectedOnPage(items)) {
    actions.push({
      icon: CheckCheck,
      label: t("page.selection.selectAllShown"),
      onClick: () =>
        selection.setMany(
          items.map((item) => item.id),
          true
        ),
    });
  }
  if (chosen.length > 0) {
    actions.push({
      icon: CirclePlus,
      label: t("page.selection.addToQueue", { count: chosen.length }),
      onClick: () => {
        void onEnqueue(chosen).then((added) => {
          if (added) selection.clear();
        });
      },
      count: chosen.length,
    });
  }
  if (isAdmin) {
    actions.push(...fileBulkActions(selectedAlbumsFileTarget(items, inLibraryIds), inLibraryIds.length, fileActions));
  }

  return (
    <BulkActionBar
      count={selection.selectedCount}
      countLabel={t("page.selection.selectedAlbums")}
      actions={actions}
      clearLabel={t("page.selection.clear")}
      onClear={selection.clear}
    />
  );
}
