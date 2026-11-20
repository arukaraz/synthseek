import { suggestedSkeleton, suggestedSkeletonBlock } from "./styles";

export function SuggestedSkeletonRow() {
  return (
    <div className={suggestedSkeleton()} aria-hidden>
      <span className={suggestedSkeletonBlock({ shape: "disc" })} />
      <span className={suggestedSkeletonBlock({ shape: "cover" })} />
      <span className={suggestedSkeletonBlock({ shape: "line" })} />
      <span className={suggestedSkeletonBlock({ shape: "pill" })} />
    </div>
  );
}
