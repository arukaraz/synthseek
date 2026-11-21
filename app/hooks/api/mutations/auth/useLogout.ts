import { trpc } from "@utils/trpc";

export function useLogout() {
  const utils = trpc.useUtils();

  return trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });
}
