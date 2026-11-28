import { trpc } from "@utils/trpc";

export function useSetupProgress(options: { enabled: boolean }) {
  return trpc.settings.setup.progress.useQuery(undefined, {
    enabled: options.enabled,
    staleTime: 0,
    refetchOnMount: "always",
  });
}
