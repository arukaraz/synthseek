import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useUpdateAccessibility() {
  const utils = trpc.useUtils();
  return trpc.auth.updateProfile.useMutation({
    onSuccess: (user) => {
      utils.auth.me.setData(undefined, user);
    },
    onError: (error) => errorToast(error, "auth.updateProfileFailed"),
  });
}
