import { SKELETON_ROWS, SKELETON_STATS } from "./constants";
import {
  sectionHeaderRow,
  skeletonBar,
  skeletonFrame,
  skeletonHero,
  skeletonRows,
  skeletonStat,
  skeletonStats,
} from "./styles";

export function LeaderboardSkeleton() {
  return (
    <div className={skeletonFrame()}>
      <div className={skeletonStats()}>
        {SKELETON_STATS.map((i) => (
          <div key={i} className={skeletonStat()}>
            <div className={skeletonBar({ shape: "statValue" })} />
            <div className={skeletonBar({ shape: "statLabel" })} />
          </div>
        ))}
      </div>
      <div className={sectionHeaderRow()}>
        <div className={skeletonBar({ shape: "label" })} />
        <div className={skeletonBar({ shape: "tabs" })} />
      </div>
      <div className={skeletonHero()}>
        <div className={skeletonBar({ shape: "hero" })} />
      </div>
      <div className={skeletonRows()}>
        {SKELETON_ROWS.map((i) => (
          <div key={i} className={skeletonBar({ shape: "row" })} />
        ))}
      </div>
    </div>
  );
}
