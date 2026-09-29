import { trpc } from "@utils/trpc";

export function useSystemStatus(enabled: boolean) {
  return trpc.maintenance.systemStatus.useQuery(undefined, { enabled, refetchOnMount: "always" });
}
