import type { trpc } from "@utils/trpc";

type Utils = ReturnType<typeof trpc.useUtils>;

export function invalidateLibraryViews(utils: Utils): void {
  void utils.library.getAlbums.invalidate();
  void utils.library.getArtists.invalidate();
  void utils.library.getPlaylists.invalidate();
  void utils.library.getTracks.invalidate();
  void utils.library.getCounts.invalidate();
}
