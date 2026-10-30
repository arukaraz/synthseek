import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useExportBoardTemplate() {
  return trpc.discovery.board.templateExport.useMutation({
    onError: (error) => errorToast(error, "discovery.templateExportFailed"),
  });
}
