"use client";

import { STEPS, SETUP_LOADING_LABEL } from "../constants";
import { skeletonBlock, skeletonRoot, stepProgress } from "../styles";

export function SetupSkeleton() {
  return (
    <div role="status" aria-busy="true" className={skeletonRoot()}>
      <span className="sr-only">{SETUP_LOADING_LABEL}</span>

      <div aria-hidden="true" className={stepProgress()}>
        {STEPS.map((step) => (
          <span key={step} className={skeletonBlock({ className: "h-1.5 flex-1" })} />
        ))}
      </div>

      <div aria-hidden="true" className="flex flex-col gap-2">
        <span className={skeletonBlock({ className: "h-3 w-24" })} />
        <span className={skeletonBlock({ className: "h-7 w-3/5" })} />
        <span className={skeletonBlock({ className: "h-4 w-full" })} />
        <span className={skeletonBlock({ className: "h-4 w-4/5" })} />
      </div>

      <div aria-hidden="true" className="flex flex-col gap-4">
        <span className={skeletonBlock({ className: "h-10 w-full" })} />
        <span className={skeletonBlock({ className: "h-10 w-full" })} />
        <span className={skeletonBlock({ className: "h-10 w-full" })} />
      </div>

      <div aria-hidden="true" className="flex items-center justify-between gap-3">
        <span className={skeletonBlock({ className: "h-9 w-16" })} />
        <span className={skeletonBlock({ className: "h-10 w-32" })} />
      </div>
    </div>
  );
}
