import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useRevealSettingsSecret() {
  const { mutateAsync } = trpc.settings.revealSecret.useMutation({
    onError: (error) => errorToast(error, "settings.revealSecretFailed"),
  });
  return async (ref: Parameters<typeof mutateAsync>[0]): Promise<string> => (await mutateAsync(ref)).value;
}
