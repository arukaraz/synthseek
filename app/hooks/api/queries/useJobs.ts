import { trpc } from "@utils/trpc";

export function useJobs() {
  return trpc.jobs.list.useQuery(undefined, {
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}
