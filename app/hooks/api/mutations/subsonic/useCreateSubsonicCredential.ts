import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useCreateSubsonicCredential() {
  const utils = trpc.useUtils();

  return trpc.subsonic.createCredential.useMutation({
    onSuccess: () => {
      utils.subsonic.listCredentials.invalidate();
    },
    onError: (error) => errorToast(error, "subsonic.createFailed"),
  });
}
