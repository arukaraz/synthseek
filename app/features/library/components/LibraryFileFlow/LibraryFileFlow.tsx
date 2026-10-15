"use client";

import { ConfirmationModal } from "@components/ui/ConfirmationModal";
import { TOAST_DETAIL_DURATION_MS } from "@components/ui/Toaster/constants";
import { useDeleteLibraryFiles, useMoveLibraryFiles } from "@hooks/api/mutations/library/useLibraryFiles";
import type { LibraryFilesStatus } from "@hooks/api/queries/library/types";
import { useAuthContext } from "@modules/providers/AuthProvider";
import { useCallback } from "react";
import { toast } from "sonner";

import { useLibraryFileJob } from "../../hooks/useLibraryFileJob";
import type { LibraryFileJob } from "../../types";
import { FileFailureList } from "./FileFailureList";
import { FileJobDialog } from "./FileJobDialog";
import { deleteCopy, fileJobSummary, fileSelectionOf } from "./helpers";
import { MoveFilesDialog } from "./MoveFilesDialog";
import type { LibraryFileFlowProps } from "./types";

export function LibraryFileFlow({ request, onClose, onStarted }: LibraryFileFlowProps) {
  const { isAdmin } = useAuthContext();
  const moveFiles = useMoveLibraryFiles();
  const deleteFiles = useDeleteLibraryFiles();

  const handleSettled = useCallback((job: LibraryFileJob, status: LibraryFilesStatus) => {
    const summary = fileJobSummary(job, status);
    const options =
      status.failures.length > 0
        ? {
            description: <FileFailureList failures={status.failures} failedCount={status.failed} />,
            duration: TOAST_DETAIL_DURATION_MS,
          }
        : {};
    if (summary.tone === "success") toast.success(summary.title, options);
    else if (summary.tone === "warning") toast.warning(summary.title, options);
    else toast.error(summary.title, options);
  }, []);

  const job = useLibraryFileJob(isAdmin, handleSettled);

  if (!isAdmin) return null;

  const deleting = request?.kind === "delete" ? deleteCopy(request.target) : null;

  return (
    <>
      {request?.kind === "move" ? (
        <MoveFilesDialog
          target={request.target}
          pending={moveFiles.isPending}
          onCancel={onClose}
          onConfirm={(path) =>
            moveFiles.mutate(
              { selection: fileSelectionOf(request.target), targetPathId: path.id },
              {
                onSuccess: (result) => {
                  if (result.outcome !== "started") return;
                  job.begin({ kind: "move", targetLabel: path.label });
                  onStarted(request);
                  onClose();
                },
              }
            )
          }
        />
      ) : null}

      <ConfirmationModal
        isOpen={request?.kind === "delete"}
        onClose={onClose}
        onConfirm={() => {
          if (request?.kind !== "delete") return;
          const confirmed = request;
          deleteFiles.mutate(
            { selection: fileSelectionOf(confirmed.target) },
            {
              onSuccess: (result) => {
                if (result.outcome !== "started") return;
                job.begin({ kind: "delete" });
                onStarted(confirmed);
              },
            }
          );
        }}
        title={deleting?.title ?? ""}
        message={deleting?.message ?? ""}
        confirmText={deleting?.confirm}
        variant="danger"
      />

      {job.job?.visible ? <FileJobDialog job={job.job} report={job.report} onHide={job.hide} /> : null}
    </>
  );
}
