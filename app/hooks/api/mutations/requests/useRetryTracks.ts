import type { ParseKeys } from "i18next";
import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

type SkipReason = "notFound" | "forbidden" | "notRetryable" | "retryError";

const SKIP_REASON_KEYS: Record<SkipReason, ParseKeys<"mutations">> = {
  notFound: "requests.retrySkipNotFound",
  forbidden: "requests.retrySkipForbidden",
  notRetryable: "requests.retrySkipNotRetryable",
  retryError: "requests.retrySkipRetryError",
};

function summarizeSkips(skipped: { reason: SkipReason }[]): string {
  const counts = new Map<SkipReason, number>();
  for (const { reason } of skipped) {
    counts.set(reason, (counts.get(reason) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([reason, count]) => i18n.t(`mutations:${SKIP_REASON_KEYS[reason]}`, { count }))
    .join(" · ");
}

export function useRetryTracks() {
  const utils = trpc.useUtils();

  return trpc.requests.retryTracks.useMutation({
    onError: (error) => errorToast(error, "requests.retryTrackFailed"),
    onSuccess: ({ retried, skipped }) => {
      const skipSummary = skipped.length > 0 ? summarizeSkips(skipped) : null;
      if (retried > 0) {
        toast.success(i18n.t("mutations:requests.tracksRetried", { count: retried }), {
          description: skipSummary
            ? i18n.t("mutations:requests.tracksRetrySkipped", { count: skipped.length, reasons: skipSummary })
            : undefined,
        });
      } else if (skipSummary) {
        toast.warning(i18n.t("mutations:requests.tracksRetryAllSkipped"), { description: skipSummary });
      } else {
        toast.info(i18n.t("mutations:requests.noFailedToRetry"));
      }
    },
    onSettled: () => {
      void utils.requests.getAll.invalidate();
      void utils.library.getTracks.invalidate();
      void utils.library.getCounts.invalidate();
      void utils.contentDetail.albumDetail.invalidate();
      void utils.contentDetail.artistTopTracks.invalidate();
      void utils.contentDetail.playlistDetail.invalidate();
    },
  });
}
