import { trpc } from "@utils/trpc";

export function useImportReview(options?: { enabled?: boolean }) {
  return trpc.requests.review.list.useQuery(undefined, {
    staleTime: 30 * 1000,
    enabled: options?.enabled ?? true,
  });
}
