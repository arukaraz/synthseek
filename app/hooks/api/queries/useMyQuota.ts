import { trpc } from "@utils/trpc";

export function useMyQuota() {
  return trpc.requests.myQuota.useQuery(undefined, { refetchOnMount: "always" });
}
