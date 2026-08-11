import type { ParseKeys } from "i18next";
import { toast } from "sonner";

import type { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@api/__generated__/types";
import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

type ApproveOutcome = inferRouterOutputs<AppRouter>["requests"]["review"]["approve"]["outcome"];

interface ApproveToast {
  level: "success" | "info" | "warning" | "error";
  title: ParseKeys<"mutations">;
  description: ParseKeys<"mutations">;
}

const APPROVE_TOASTS: Record<ApproveOutcome, ApproveToast> = {
  imported: { level: "success", title: "review.imported.title", description: "review.imported.description" },
  already_in_library: {
    level: "info",
    title: "review.alreadyInLibrary.title",
    description: "review.alreadyInLibrary.description",
  },
  already_in_progress: {
    level: "info",
    title: "review.alreadyInProgress.title",
    description: "review.alreadyInProgress.description",
  },
  retryable: { level: "warning", title: "review.retryable.title", description: "review.retryable.description" },
  failed: { level: "error", title: "review.failed.title", description: "review.failed.description" },
};

export function useApproveHeldImport() {
  const utils = trpc.useUtils();

  return trpc.requests.review.approve.useMutation({
    onSuccess: ({ outcome }) => {
      const { level, title, description } = APPROVE_TOASTS[outcome];
      toast[level](i18n.t(`mutations:${title}`), { description: i18n.t(`mutations:${description}`) });
    },
    onError: (error) => errorToast(error, "review.approveFailed"),
    onSettled: () => {
      utils.requests.review.list.invalidate();
      utils.requests.getAll.invalidate();
    },
  });
}
