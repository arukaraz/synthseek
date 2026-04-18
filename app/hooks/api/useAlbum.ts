import { trpc } from "@utils/trpc";
import { useAlbumMutations } from "./mutations/useAlbumMutations";

export default function useAlbum() {
  const {
    data: albums,
    refetch,
    isLoading,
  } = trpc.requests.getAllAlbums.useQuery(undefined, {
    staleTime: 2000,
    refetchOnMount: "always",
  });

  const mutations = useAlbumMutations();

  return {
    albums,
    isLoading,
    refreshAlbums: refetch,
    getActions: mutations.getActions,
    update: mutations.update,
    delete: mutations.delete,
    retry: mutations.retry,
    retryAllFailed: mutations.retryAll,
    deleteAll: mutations.deleteAllAlbums,
    isRetryingAll: mutations.isRetryingAll,
    isDeletingAll: mutations.isDeletingAll,
  };
}
