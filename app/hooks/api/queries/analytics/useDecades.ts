import { trpc } from "@utils/trpc";

export function useDecades() {
  return trpc.analytics.library.decades.useQuery();
}
