import { RequestStatus, SubscriptionEventType, type SubscriptionEvent } from "@api/__generated__/types";
import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "@utils/trpc";
import { useRef } from "react";
import {
  handleAlbumUpdate,
  handleLibraryImportProgress,
  handlePlaylistPlexCreated,
  handlePlaylistUpdate,
  handlePlexSyncAllProgress,
  handlePortabilityProgress,
  handleTrackUpdate,
} from "./handlers/requests";
import { handleSettingsUpdate, handleVersionUpdate } from "./handlers/system";
import { isDuplicate } from "./shared/dedup";
import { invalidateLibraryViews } from "./shared/libraryInvalidation";

const TERMINAL_STATUSES = new Set<string>([
  RequestStatus.enum.complete,
  RequestStatus.enum.failed,
  RequestStatus.enum.cancelled,
  RequestStatus.enum.delegated,
]);

const MAX_RECONNECT_ATTEMPTS = 3;

export function useSubscriptions() {
  const utils = trpc.useUtils();
  const queryClient = useQueryClient();
  const reconnectAttemptsRef = useRef(0);
  const lastEventRef = useRef<Map<string, number>>(new Map());

  trpc.subscriptionEvents.onEvent.useSubscription(undefined, {
    onStarted: () => {
      reconnectAttemptsRef.current = 0;
    },

    onData: (event: SubscriptionEvent) => {
      if (isDuplicate(event, lastEventRef.current)) return;

      switch (event.eventType) {
        case SubscriptionEventType.TrackUpdate:
          handleTrackUpdate(event, utils, queryClient);
          if (TERMINAL_STATUSES.has(event.status)) {
            utils.requests.getLibrarySummary.invalidate();
          }
          if (event.status === RequestStatus.enum.complete) {
            invalidateLibraryViews(utils);
          }
          break;
        case SubscriptionEventType.AlbumUpdate:
          handleAlbumUpdate(event, utils);
          break;
        case SubscriptionEventType.PlaylistUpdate:
          handlePlaylistUpdate(event, utils);
          break;
        case SubscriptionEventType.PlaylistPlexCreated:
          handlePlaylistPlexCreated(event, utils);
          break;
        case SubscriptionEventType.PlexSyncAllProgress:
          handlePlexSyncAllProgress(event, utils);
          break;
        case SubscriptionEventType.VersionUpdate:
          handleVersionUpdate(event);
          break;
        case SubscriptionEventType.SettingsUpdate:
          handleSettingsUpdate(event, utils);
          break;
        case SubscriptionEventType.PortabilityProgress:
          handlePortabilityProgress(event);
          break;
        case SubscriptionEventType.LibraryImportProgress:
          handleLibraryImportProgress(event, utils);
          break;
      }

      reconnectAttemptsRef.current = 0;
    },

    onError: () => {
      reconnectAttemptsRef.current++;

      if (reconnectAttemptsRef.current > MAX_RECONNECT_ATTEMPTS) {
        utils.requests.getAll.invalidate();
        reconnectAttemptsRef.current = 0;
      }
    },
  });

  return null;
}
