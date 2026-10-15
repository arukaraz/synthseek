"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { ConfirmationModal } from "@components/ui/ConfirmationModal";
import { useRemoveLibraryPath } from "@hooks/api/mutations/library/useLibraryPaths";

import type { RemovePathActionProps } from "./types";

export function RemovePathAction({ path, songCount = null, onRemoved, onBlocked }: RemovePathActionProps) {
  const { t } = useTranslation("settings");
  const [confirming, setConfirming] = useState(false);
  const remove = useRemoveLibraryPath();
  const forgetting = songCount !== null;
  const songs = { count: songCount ?? 0, formatted: (songCount ?? 0).toLocaleString() };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive-vivid"
        onClick={() => setConfirming(true)}
        disabled={remove.isPending}
      >
        {remove.isPending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <Trash2 className="size-4" aria-hidden />
        )}
        {forgetting ? t("libraryPaths.remove.forgetAction") : t("libraryPaths.remove.action")}
      </Button>
      <ConfirmationModal
        isOpen={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={() =>
          remove.mutate(
            { id: path.id, forgetSongs: forgetting },
            {
              onSuccess: (result) => {
                if (result.outcome === "blocked") {
                  onBlocked(result.blockers);
                  return;
                }
                onRemoved();
              },
            }
          )
        }
        title={
          forgetting
            ? t("libraryPaths.remove.forgetConfirmTitle", { label: path.label })
            : t("libraryPaths.remove.confirmTitle", { label: path.label })
        }
        message={
          forgetting ? t("libraryPaths.remove.forgetConfirmMessage", songs) : t("libraryPaths.remove.confirmMessage")
        }
        confirmText={forgetting ? t("libraryPaths.remove.forgetConfirmYes") : t("libraryPaths.remove.confirmYes")}
        variant="danger"
      />
    </>
  );
}
