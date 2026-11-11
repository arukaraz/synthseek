import { trpc } from "@utils/trpc";

export function useDismissWhatsNew() {
  const utils = trpc.useUtils();
  return trpc.updates.dismissWhatsNew.useMutation({
    onMutate: async () => {
      await utils.updates.whatsNew.cancel();
      utils.updates.whatsNew.setData(undefined, (current) => (current ? { ...current, pending: false } : current));
    },
    onSuccess: () => utils.updates.whatsNew.invalidate(),
  });
}
