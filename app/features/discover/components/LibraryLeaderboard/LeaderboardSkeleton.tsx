import { sectionHeaderRow, skeletonFrame } from "./styles";

export function LeaderboardSkeleton() {
  return (
    <div className={skeletonFrame()}>
      <div className="border-fg/10 grid grid-cols-3 border-b">
        {[1, 2, 3].map((i) => (
          <div key={i} className="py-3 text-center">
            <div className="bg-fg/10 mx-auto h-5 w-10 rounded" />
            <div className="bg-fg/10 mx-auto mt-1.5 h-2.5 w-14 rounded" />
          </div>
        ))}
      </div>
      <div className={sectionHeaderRow()}>
        <div className="bg-fg/10 h-3 w-24 rounded" />
        <div className="bg-fg/10 h-6 w-32 rounded" />
      </div>
      <div className="border-fg/10 border-b p-3">
        <div className="bg-fg/10 h-16 w-full rounded" />
      </div>
      <div className="space-y-2 px-4 py-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-fg/10 h-4 w-full rounded" />
        ))}
      </div>
    </div>
  );
}
