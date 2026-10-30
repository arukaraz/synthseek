import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useImportWidgetPreview() {
  return trpc.widgets.importPreview.useMutation({
    onError: (error) => errorToast(error, "widgets.importFailed"),
  });
}
