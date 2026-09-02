import { trpc } from "@utils/trpc";

const IDLE_POLL_MS = 60 * 1000;
const RUNNING_POLL_MS = 8 * 1000;

export function useJobs() {
  return trpc.jobs.list.useQuery(undefined, {
    staleTime: 30 * 1000,
    refetchInterval: (query) =>
      query.state.data?.some((job) => job.running && job.listed && job.enabled) ? RUNNING_POLL_MS : IDLE_POLL_MS,
  });
}
