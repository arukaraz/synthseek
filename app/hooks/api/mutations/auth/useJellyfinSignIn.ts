import { trpc } from "@utils/trpc";

export function useJellyfinSignIn() {
  const utils = trpc.useUtils();

  return trpc.auth.jellyfinSignIn.useMutation({
    onSuccess: (user) => {
      utils.auth.me.setData(undefined, user);
    },
  });
}
