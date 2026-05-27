import { trpc } from "@utils/trpc";

export function useUsers(options?: { enabled?: boolean }) {
  return trpc.users.list.useQuery(undefined, {
    enabled: options?.enabled,
  });
}
