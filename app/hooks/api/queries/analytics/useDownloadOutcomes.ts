import { trpc } from "@utils/trpc";

export function useDownloadOutcomes() {
  return trpc.analytics.pipeline.downloads.useQuery();
}
