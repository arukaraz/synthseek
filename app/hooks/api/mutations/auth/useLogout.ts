import { trpc } from "@utils/trpc";

export function useLogout() {
  const utils = trpc.useUtils();

  return trpc.auth.logout.useMutation({
    onSuccess: async () => {
      // Drop every cached query — the new user (or anonymous) should not see it.
      utils.invalidate();
      utils.auth.me.setData(undefined, null);
    },
  });
}
