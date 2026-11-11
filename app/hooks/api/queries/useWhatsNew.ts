import { useAuthContext } from "@modules/providers/AuthProvider";
import { trpc } from "@utils/trpc";

export function useWhatsNew() {
  const { isAdmin } = useAuthContext();
  return trpc.updates.whatsNew.useQuery(undefined, {
    enabled: isAdmin,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
