import { trpc } from "@utils/trpc";
import { useCallback } from "react";
import { toast } from "sonner";
import { ContentType, RequestMatchingMode, RequestStatus, type TrackRequestWithAlbum } from "@api/__generated__/types";

export function useRequestMutations() {
  const utils = trpc.useUtils();

  const addTrackRequestMutation = trpc.requests.createTrack.useMutation({
    onMutate: async (newRequest) => {
      await utils.requests.getAll.cancel();
      const previous = utils.requests.getAll.getData();

      utils.requests.getAll.setData(undefined, (old) => {
        if (!old) return old;

        const optimisticRequest = {
          id: crypto.randomUUID(),
          spotify_id: newRequest.spotify_id,
          title: newRequest.title,
          artist: newRequest.artist,
          track_number: newRequest.track_number ?? null,
          duration_ms: newRequest.duration_ms ?? null,
          status: RequestStatus.enum.queued,
          progress: 0,
          created_at: new Date(),
          updated_at: new Date(),
          request_type: ContentType.enum.track,
          user_id: null,
          album_id: crypto.randomUUID(),
          completed_at: null,
          error: null,
          source: newRequest.source ?? "spotify",
          bitrate: newRequest.bitrate || 320,
          format: newRequest.format || "mp3",
          format_matching: RequestMatchingMode.enum.flexible,
          bitrate_matching: RequestMatchingMode.enum.flexible,
          slskd_request_id: crypto.randomUUID(),
          disc_number: 1,
          isrc: newRequest?.isrc || null,
          explicit: newRequest.explicit ?? false,
          Album: null,
        } as unknown as TrackRequestWithAlbum;

        return [optimisticRequest, ...old];
      });

      return { previous };
    },
    onError: (err, newRequest, context) => {
      if (context?.previous) {
        utils.requests.getAll.setData(undefined, context.previous);
      }
      toast.error(`Failed to add request: ${err.message}`);
    },
    onSuccess: () => {
      toast.success("Track added to queue");
    },
    onSettled: () => {
      utils.requests.getAll.invalidate();
      utils.requests.getAllAlbums.invalidate();
    },
  });

  const addAlbumRequestMutation = trpc.requests.batchRequest.useMutation({
    onMutate: async () => {
      await utils.requests.getAll.cancel();
      const previous = utils.requests.getAll.getData();
      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        utils.requests.getAll.setData(undefined, context.previous);
      }
      toast.error(`Failed to add album: ${err.message}`);
    },
    onSuccess: (data) => {
      toast.success(`Album "${data.name}" added with ${data.total_tracks} tracks`);
    },
    onSettled: () => {
      utils.requests.getAll.invalidate();
    },
  });

  const updateRequestMutation = trpc.requests.update.useMutation({
    onMutate: async (update) => {
      await utils.requests.getAll.cancel();
      const previous = utils.requests.getAll.getData();

      utils.requests.getAll.setData(undefined, (old) => {
        if (!old) return old;
        return old.map((req) => (req.id === update.id ? { ...req, ...update, updated_at: new Date() } : req));
      });

      return { previous };
    },
    onError: (_err, _update, context) => {
      if (context?.previous) {
        utils.requests.getAll.setData(undefined, context.previous);
      }
    },
    onSettled: () => {
      utils.requests.getAll.invalidate();
    },
  });

  const deleteRequestMutation = trpc.requests.delete.useMutation({
    onMutate: async ({ id }) => {
      await utils.requests.getAll.cancel();
      const previous = utils.requests.getAll.getData();

      utils.requests.getAll.setData(undefined, (old) => {
        if (!old) return old;
        return old.filter((req) => req.id !== id);
      });

      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        utils.requests.getAll.setData(undefined, context.previous);
      }
      toast.error("Failed to delete request");
    },
    onSuccess: () => {
      toast.success("Request deleted");
    },
    onSettled: () => {
      utils.requests.getAll.invalidate();
    },
  });

  const clearCompletedRequestMutation = trpc.requests.clearCompleted.useMutation({
    onMutate: async () => {
      await utils.requests.getAll.cancel();
      const previous = utils.requests.getAll.getData();

      utils.requests.getAll.setData(undefined, (old) => {
        if (!old) return old;
        return old.filter((req) => req.status !== RequestStatus.enum.complete);
      });

      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        utils.requests.getAll.setData(undefined, context.previous);
      }
      toast.error("Failed to clear completed requests");
    },
    onSuccess: (data) => {
      toast.success(`Cleared ${data.count} completed requests`);
    },
    onSettled: () => {
      utils.requests.getAll.invalidate();
    },
  });

  const cancelTrackMutation = trpc.requests.cancelTrack.useMutation({
    onMutate: async ({ trackId }) => {
      await utils.requests.getAll.cancel();
      await utils.requests.getAllAlbums.cancel();
      const previousRequests = utils.requests.getAll.getData();
      const previousAlbums = utils.requests.getAllAlbums.getData();

      utils.requests.getAll.setData(undefined, (old) => {
        if (!old) return old;
        return old.map((req) =>
          req.id === trackId
            ? { ...req, status: RequestStatus.enum.cancelled, progress: 0, updated_at: new Date() }
            : req
        );
      });

      utils.requests.getAllAlbums.setData(undefined, (old) => {
        if (!old) return old;
        return old.map((album) => ({
          ...album,
          tracks: album.tracks.map((t) =>
            t.id === trackId ? { ...t, status: RequestStatus.enum.cancelled, progress: 0 } : t
          ),
        }));
      });

      return { previousRequests, previousAlbums };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousRequests) {
        utils.requests.getAll.setData(undefined, context.previousRequests);
      }
      if (context?.previousAlbums) {
        utils.requests.getAllAlbums.setData(undefined, context.previousAlbums);
      }
      toast.error("Failed to cancel track");
    },
    onSuccess: () => {
      toast.success("Track cancelled");
    },
    onSettled: () => {
      utils.requests.getAll.invalidate();
      utils.requests.getAllAlbums.invalidate();
    },
  });

  const retryTrackMutation = trpc.requests.retryTrack.useMutation({
    onMutate: async ({ trackId }) => {
      await utils.requests.getAll.cancel();
      await utils.requests.getAllAlbums.cancel();
      const previousRequests = utils.requests.getAll.getData();
      const previousAlbums = utils.requests.getAllAlbums.getData();

      utils.requests.getAll.setData(undefined, (old) => {
        if (!old) return old;
        return old.map((req) =>
          req.id === trackId
            ? { ...req, status: RequestStatus.enum.queued, progress: 0, error: null, updated_at: new Date() }
            : req
        );
      });

      utils.requests.getAllAlbums.setData(undefined, (old) => {
        if (!old) return old;
        return old.map((album) => ({
          ...album,
          tracks: album.tracks.map((t) =>
            t.id === trackId ? { ...t, status: RequestStatus.enum.queued, progress: 0, error: null } : t
          ),
        }));
      });

      return { previousRequests, previousAlbums };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousRequests) {
        utils.requests.getAll.setData(undefined, context.previousRequests);
      }
      if (context?.previousAlbums) {
        utils.requests.getAllAlbums.setData(undefined, context.previousAlbums);
      }
      toast.error("Failed to retry track");
    },
    onSuccess: () => {
      toast.success("Track retry queued");
    },
    onSettled: () => {
      utils.requests.getAll.invalidate();
      utils.requests.getAllAlbums.invalidate();
    },
  });

  const cancelRequestMutation = trpc.requests.cancel.useMutation({
    onMutate: async ({ id }) => {
      await utils.requests.getAll.cancel();
      const previous = utils.requests.getAll.getData();

      utils.requests.getAll.setData(undefined, (old) => {
        if (!old) return old;
        return old.map((req) =>
          req.id === id
            ? {
                ...req,
                status: RequestStatus.enum.queued,
                progress: 0,
                updated_at: new Date(),
              }
            : req
        );
      });

      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        utils.requests.getAll.setData(undefined, context.previous);
      }
      toast.error("Failed to cancel download");
    },
    onSuccess: () => {
      toast.success("Download cancelled");
    },
    onSettled: () => {
      utils.requests.getAll.invalidate();
    },
  });

  const getActions = useCallback(
    (requestId: string) => ({
      handleRemove: () => {
        deleteRequestMutation.mutate({ id: requestId });
      },
      handleRetryTrack: () => {
        retryTrackMutation.mutate({ trackId: requestId });
      },
      handleCancelTrack: () => {
        cancelTrackMutation.mutate({ trackId: requestId });
      },
      handlePause: () => {
        updateRequestMutation.mutate({
          id: requestId,
          status: RequestStatus.enum.paused,
        });
        toast.info("Download paused");
      },
      handleResume: () => {
        updateRequestMutation.mutate({
          id: requestId,
          status: RequestStatus.enum.downloading,
        });
        toast.info("Download resumed");
      },
    }),
    [deleteRequestMutation, updateRequestMutation, cancelTrackMutation, retryTrackMutation]
  );

  return {
    addTrackRequest: addTrackRequestMutation,
    addAlbumRequest: addAlbumRequestMutation,
    updateRequest: updateRequestMutation,
    deleteRequest: deleteRequestMutation,
    clearCompleted: clearCompletedRequestMutation,
    cancelRequest: cancelRequestMutation,
    cancelTrack: cancelTrackMutation,
    getActions,
  };
}
