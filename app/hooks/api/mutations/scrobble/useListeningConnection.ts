import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useBeginLastfmAuthorization() {
  return trpc.playback.scrobble.beginLastfm.useMutation({
    onError: (error) => errorToast(error, "playback.listeningConnectFailed"),
  });
}

export function useCompleteLastfmAuthorization() {
  const utils = trpc.useUtils();
  return trpc.playback.scrobble.completeLastfm.useMutation({
    onSuccess: (connections) => utils.playback.scrobble.connections.setData(undefined, connections),
    onError: (error) => errorToast(error, "playback.listeningConnectFailed"),
  });
}

export function useConnectListenBrainz() {
  const utils = trpc.useUtils();
  return trpc.playback.scrobble.connectListenBrainz.useMutation({
    onSuccess: (connections) => utils.playback.scrobble.connections.setData(undefined, connections),
    onError: (error) => errorToast(error, "playback.listeningConnectFailed"),
  });
}

export function useDisconnectListeningService() {
  const utils = trpc.useUtils();
  return trpc.playback.scrobble.disconnect.useMutation({
    onSuccess: (connections) => utils.playback.scrobble.connections.setData(undefined, connections),
    onError: (error) => errorToast(error, "playback.listeningDisconnectFailed"),
  });
}

export function useSetScrobbleEnabled() {
  const utils = trpc.useUtils();
  return trpc.playback.scrobble.setScrobbleEnabled.useMutation({
    onSuccess: (connections) => utils.playback.scrobble.connections.setData(undefined, connections),
    onError: (error) => errorToast(error, "playback.listeningSaveFailed"),
  });
}

export function useSetRelayedClients() {
  const utils = trpc.useUtils();
  return trpc.playback.scrobble.setRelayedClients.useMutation({
    onSuccess: (connections) => utils.playback.scrobble.connections.setData(undefined, connections),
    onError: (error) => errorToast(error, "playback.listeningSaveFailed"),
  });
}
