import { skeletonListItem } from "../styles";

export function LastRequestsSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={skeletonListItem()}>
          <div className="bg-fg/10 h-12 w-12 flex-shrink-0 animate-pulse rounded-md" />

          <div className="flex-1 space-y-2">
            <div className="bg-fg/10 h-4 w-3/4 animate-pulse rounded" />
            <div className="bg-fg/10 h-3 w-1/2 animate-pulse rounded" />
          </div>

          <div className="bg-fg/10 h-6 w-16 animate-pulse rounded-full" />
        </div>
      ))}
    </div>
  );
}
