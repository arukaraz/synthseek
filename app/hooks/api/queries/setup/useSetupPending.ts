import { trpc } from "@utils/trpc";

export function useSetupPending(options: { enabled: boolean }) {
  return trpc.settings.setup.pending.useQuery(undefined, {
    enabled: options.enabled,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}
