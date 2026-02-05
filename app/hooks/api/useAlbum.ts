import { useAlbumMutations, useAlbumQuery } from "./mutations/useAlbumMutations";

export default function useAlbum() {
  const { albums, isLoading, refreshAlbums } = useAlbumQuery();
  const mutations = useAlbumMutations();

  return {
    albums,
    isLoading,
    refreshAlbums,
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

export { useAlbumMutations, useAlbumQuery } from "./mutations/useAlbumMutations";
