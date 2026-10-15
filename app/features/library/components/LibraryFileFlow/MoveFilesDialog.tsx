"use client";

import { Button } from "@components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/Dialog";
import { useLibraryMovePreview } from "@hooks/api/queries/useLibraryFiles";
import { useLibraryPaths } from "@hooks/api/queries/useLibraryPaths";
import { FolderInput } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { fileSelectionOf, movableCount, moveTitle } from "./helpers";
import { MovePathOptions } from "./MovePathOptions";
import { MovePreviewPanel } from "./MovePreviewPanel";
import { flowBody, flowFooter, moveDialog } from "./styles";
import type { MoveFilesDialogProps } from "./types";

export function MoveFilesDialog({ target, pending, onCancel, onConfirm }: MoveFilesDialogProps) {
  const { t } = useTranslation(["library", "common"]);
  const paths = useLibraryPaths();
  const [pathId, setPathId] = useState<string | null>(null);
  const preview = useLibraryMovePreview(
    pathId === null ? null : { selection: fileSelectionOf(target), targetPathId: pathId }
  );

  const chosen = paths.data?.find((path) => path.id === pathId) ?? null;
  const movable = movableCount(preview.data);
  const canMove = chosen !== null && movable > 0 && !pending;

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <DialogContent className={moveDialog()}>
        <DialogHeader>
          <DialogTitle>{moveTitle(target)}</DialogTitle>
          <DialogDescription>{t("library:files.move.description")}</DialogDescription>
        </DialogHeader>

        <div className={flowBody()}>
          <MovePathOptions
            paths={paths.data}
            isLoading={paths.isLoading}
            isError={paths.isError}
            sourcePathIds={target.pathIds}
            selected={pathId}
            onSelect={setPathId}
          />
          {chosen === null ? null : (
            <MovePreviewPanel
              path={chosen}
              preview={preview.data}
              isLoading={preview.isLoading}
              isError={preview.isError}
            />
          )}
        </div>

        <DialogFooter className={flowFooter()}>
          <Button variant="ghost" onClick={onCancel}>
            {t("common:cancel")}
          </Button>
          <Button
            onClick={() => {
              if (chosen !== null) onConfirm(chosen);
            }}
            disabled={!canMove}
            aria-busy={pending}
          >
            <FolderInput aria-hidden />
            {movable > 0 ? t("library:files.move.confirm", { count: movable }) : t("library:files.move.confirmIdle")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
