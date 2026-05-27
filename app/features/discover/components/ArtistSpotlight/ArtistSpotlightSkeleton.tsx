import { ARTIST_SPOTLIGHT_COUNT } from "./constants";

export function ArtistSpotlightSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {Array.from({ length: ARTIST_SPOTLIGHT_COUNT }).map((_, i) => (
        <div key={i} className="bg-fg/5 aspect-3/4 animate-pulse rounded-lg" />
      ))}
    </div>
  );
}
