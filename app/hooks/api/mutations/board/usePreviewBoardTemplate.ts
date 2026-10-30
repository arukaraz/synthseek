import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function usePreviewBoardTemplate() {
  return trpc.discovery.board.templatePreview.useMutation({
    onError: (error) => errorToast(error, "discovery.templateFailed"),
  });
}
