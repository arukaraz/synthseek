import type { ParseKeys } from "i18next";
import { toast } from "sonner";

import type { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@api/__generated__/types";
import { failReviewApproval, markReviewApprovalStarted } from "@hooks/api/subscriptions";
import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

type ApproveOutcome = inferRouterOutputs<AppRouter>["requests"]["review"]["approve"]["outcome"];

interface ApproveToast {
  level: "success" | "info" | "warning" | "error";
  title: ParseKeys<"mutations">;
  description: ParseKeys<"mutations">;
}

const APPROVE_TOASTS: Record<ApproveOutcome, ApproveToast | null> = {
  started: null,
  already_in_progress: {
    level: "info",
    title: "review.alreadyInProgress.title",
    description: "review.alreadyInProgress.description",
  },
};

export function useApproveHeldImport() {
  const utils = trpc.useUtils();

  return trpc.requests.review.approve.useMutation({
    onSuccess: ({ outcome }, { id }) => {
      markReviewApprovalStarted(id);
      const entry = APPROVE_TOASTS[outcome];
      if (entry === null) return;
      toast[entry.level](i18n.t(`mutations:${entry.title}`), { description: i18n.t(`mutations:${entry.description}`) });
    },
    onError: (error, { id }) => {
      failReviewApproval(id);
      errorToast(error, "review.approveFailed");
    },
    onSettled: () => {
      void utils.requests.review.list.invalidate();
      void utils.requests.getAll.invalidate();
    },
  });
}
