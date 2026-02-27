import { RequestStatus, type AlbumWithTracks } from "@api/__generated__/types";
import { trpc } from "@utils/trpc";
import { useCallback } from "react";
import { toast } from "sonner";

export function useAlbumMutations() {
  const utils = trpc.useUtils();

  const updateMutation = trpc.requests.updateAlbum.useMutation({
    onMutate: async (update) => {
      await utils.requests.getAllAlbums.cancel();
      const previous = utils.requests.getAllAlbums.getData();

      utils.requests.getAllAlbums.setData(undefined, (old) => {
        if (!old) return old;
        return old.map((album) => (album.id === update.id ? { ...album, ...update, updated_at: new Date() } : album));
      });

      return { previous };
    },
    onError: (err, _update, context) => {
      if (context?.previous) {
        utils.requests.getAllAlbums.setData(undefined, context.previous);
      }
      toast.error(`Failed to update album: ${err.message}`);
    },
    onSettled: () => {
      utils.requests.getAllAlbums.invalidate();
      utils.requests.getAll.invalidate();
    },
  });

  const deleteMutation = trpc.requests.deleteAlbum.useMutation({
    onMutate: async ({ albumId }) => {
      await utils.requests.getAllAlbums.cancel();
      await utils.requests.getAll.cancel();
      const previousAlbums = utils.requests.getAllAlbums.getData();
      const previousRequests = utils.requests.getAll.getData();

      utils.requests.getAllAlbums.setData(undefined, (old) => {
        if (!old) return old;
        return old.filter((album) => album.id !== albumId);
      });

      utils.requests.getAll.setData(undefined, (old) => {
        if (!old) return old;
        return old.filter((req) => req.album_id !== albumId);
      });

      return { previousAlbums, previousRequests };
    },
    onError: (err, _variables, context) => {
      if (context?.previousAlbums) {
        utils.requests.getAllAlbums.setData(undefined, context.previousAlbums);
      }
      if (context?.previousRequests) {
        utils.requests.getAll.setData(undefined, context.previousRequests);
      }
      toast.error("Failed to delete album");
    },
    onSuccess: () => {
      toast.success("Album deleted");
    },
    onSettled: () => {
      utils.requests.getAllAlbums.invalidate();
      utils.requests.getAll.invalidate();
    },
  });

  const cancelMutation = trpc.requests.cancelAlbum.useMutation({
    onMutate: async ({ albumId }) => {
      await utils.requests.getAllAlbums.cancel();
      await utils.requests.getAll.cancel();
      const previousAlbums = utils.requests.getAllAlbums.getData();
      const previousRequests = utils.requests.getAll.getData();

      utils.requests.getAllAlbums.setData(undefined, (old) => {
        if (!old) return old;
        return old.map((album) => {
          if (album.id !== albumId) return album;
          return {
            ...album,
            status: RequestStatus.enum.cancelled,
            tracks: album.tracks.map((t) =>
              t.status !== RequestStatus.enum.complete &&
              t.status !== RequestStatus.enum.failed &&
              t.status !== RequestStatus.enum.cancelled
                ? { ...t, status: RequestStatus.enum.cancelled, progress: 0 }
                : t
            ),
          };
        });
      });

      return { previousAlbums, previousRequests };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousAlbums) {
        utils.requests.getAllAlbums.setData(undefined, context.previousAlbums);
      }
      if (context?.previousRequests) {
        utils.requests.getAll.setData(undefined, context.previousRequests);
      }
      toast.error("Failed to cancel album");
    },
    onSuccess: () => {
      toast.success("Album cancelled");
    },
    onSettled: () => {
      utils.requests.getAllAlbums.invalidate();
      utils.requests.getAll.invalidate();
    },
  });

  const retryMutation = trpc.requests.retryAlbum.useMutation({
    onMutate: async () => {
      await utils.requests.getAllAlbums.cancel();
      await utils.requests.getAll.cancel();
      const previousAlbums = utils.requests.getAllAlbums.getData();
      const previousRequests = utils.requests.getAll.getData();
      return { previousAlbums, previousRequests };
    },
    onError: (err, _variables, context) => {
      if (context?.previousAlbums) {
        utils.requests.getAllAlbums.setData(undefined, context.previousAlbums);
      }
      if (context?.previousRequests) {
        utils.requests.getAll.setData(undefined, context.previousRequests);
      }
      toast.error("Failed to retry album");
    },
    onSuccess: () => {
      toast.success("Album retry started");
    },
    onSettled: () => {
      utils.requests.getAllAlbums.invalidate();
      utils.requests.getAll.invalidate();
    },
  });

  const retryAllFailedMutation = trpc.requests.retryAllFailed.useMutation({
    onError: () => {
      toast.error("Failed to retry albums");
    },
    onSuccess: (data) => {
      if (data.retried > 0) {
        toast.success(`Retrying ${data.retried} album${data.retried > 1 ? "s" : ""}`);
      } else {
        toast.info("No failed albums to retry");
      }
    },
    onSettled: () => {
      utils.requests.getAllAlbums.invalidate();
      utils.requests.getAll.invalidate();
    },
  });

  const deleteAllMutation = trpc.requests.deleteAllAlbums.useMutation({
    onMutate: async () => {
      await utils.requests.getAllAlbums.cancel();
      await utils.requests.getAll.cancel();
      const previousAlbums = utils.requests.getAllAlbums.getData();
      const previousRequests = utils.requests.getAll.getData();

      utils.requests.getAllAlbums.setData(undefined, []);
      utils.requests.getAll.setData(undefined, []);

      return { previousAlbums, previousRequests };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousAlbums) {
        utils.requests.getAllAlbums.setData(undefined, context.previousAlbums);
      }
      if (context?.previousRequests) {
        utils.requests.getAll.setData(undefined, context.previousRequests);
      }
      toast.error("Failed to delete all albums");
    },
    onSuccess: (data) => {
      toast.success(`Deleted ${data.deleted} album${data.deleted > 1 ? "s" : ""}`);
    },
    onSettled: () => {
      utils.requests.getAllAlbums.invalidate();
      utils.requests.getAll.invalidate();
    },
  });

  const getActions = useCallback(
    (albumId: string) => ({
      handleRemove: () => {
        deleteMutation.mutate({ albumId });
      },
      handleRetryAlbum: () => {
        retryMutation.mutate({ albumId });
      },
      handleCancelAlbum: () => {
        cancelMutation.mutate({ albumId });
      },
    }),
    [deleteMutation, retryMutation, cancelMutation]
  );

  return {
    update: updateMutation,
    delete: deleteMutation,
    cancel: cancelMutation,
    retry: retryMutation,
    retryAllFailed: retryAllFailedMutation,
    deleteAll: deleteAllMutation,
    getActions,
    retryAll: () => retryAllFailedMutation.mutate(),
    deleteAllAlbums: () => deleteAllMutation.mutate(),
    isRetryingAll: retryAllFailedMutation.isPending,
    isDeletingAll: deleteAllMutation.isPending,
  };
}

export function useAlbumQuery() {
  const {
    data: albums,
    refetch,
    isLoading,
  } = trpc.requests.getAllAlbums.useQuery(undefined, {
    staleTime: 2000,
    refetchOnMount: "always",
  });

  return {
    albums: albums as AlbumWithTracks[] | undefined,
    isLoading,
    refreshAlbums: refetch,
  };
}
