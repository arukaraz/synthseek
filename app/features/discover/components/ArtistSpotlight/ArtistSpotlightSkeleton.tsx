import { ARTIST_SPOTLIGHT_COUNT } from "./constants";
import { spotlightGrid, spotlightSkeletonCard } from "./styles";

export function ArtistSpotlightSkeleton() {
  return (
    <div className={spotlightGrid()}>
      {Array.from({ length: ARTIST_SPOTLIGHT_COUNT }).map((_, i) => (
        <div key={i} className={spotlightSkeletonCard()} />
      ))}
    </div>
  );
}
