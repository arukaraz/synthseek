import { trpc } from "@utils/trpc";

export function usePatchNotes() {
  return trpc.updates.patchNotes.useQuery(undefined, {
    staleTime: 10 * 60 * 1000,
  });
}
