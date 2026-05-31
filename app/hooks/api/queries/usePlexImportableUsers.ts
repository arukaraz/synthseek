import { trpc } from "@utils/trpc";

export function usePlexImportableUsers(options?: { enabled?: boolean }) {
  return trpc.users.plexImportable.useQuery(undefined, {
    enabled: options?.enabled,
    staleTime: 30 * 1000,
    retry: false,
  });
}
