import { trpc } from "@utils/trpc";

export function usePrivacyOverview() {
  return trpc.privacy.overview.useQuery(undefined, { refetchOnMount: "always" });
}
