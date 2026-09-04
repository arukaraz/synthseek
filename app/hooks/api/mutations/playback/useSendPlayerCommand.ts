import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useSendPlayerCommand() {
  return trpc.playback.sendCommand.useMutation({
    onError: (error) => errorToast(error, "playback.commandFailed"),
  });
}
