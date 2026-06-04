import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useCreateApiKey() {
  const utils = trpc.useUtils();
  return trpc.apiKeys.create.useMutation({
    onSuccess: () => {
      utils.apiKeys.list.invalidate();
    },
    onError: (error) => errorToast(error, "apiKeys.createFailed"),
  });
}
