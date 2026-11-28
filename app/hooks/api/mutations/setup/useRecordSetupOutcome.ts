import { trpc } from "@utils/trpc";

export function useRecordSetupOutcome() {
  const utils = trpc.useUtils();

  return trpc.settings.setup.recordOutcome.useMutation({
    onSuccess: (progress) => {
      utils.settings.setup.progress.setData(undefined, progress);
    },
  });
}
