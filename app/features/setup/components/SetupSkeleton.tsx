"use client";

import { STEPS, SETUP_LOADING_LABEL } from "../constants";
import { skeletonBlock, stepFooter, stepProgress, wizardBody, wizardBrand, wizardCard, wizardHead } from "../styles";

export function SetupSkeleton() {
  return (
    <div role="status" aria-busy="true" className={wizardCard()}>
      <span className="sr-only">{SETUP_LOADING_LABEL}</span>

      <div className={wizardHead()}>
        <div aria-hidden="true" className={wizardBrand()}>
          <span className={skeletonBlock({ className: "h-9 w-40" })} />
          <span className={skeletonBlock({ className: "h-2.5 w-24" })} />
        </div>
        <div aria-hidden="true" className={stepProgress()}>
          {STEPS.map((step) => (
            <span key={step} className={skeletonBlock({ className: "h-1.5 flex-1" })} />
          ))}
        </div>
      </div>

      <div className={wizardBody()}>
        <div aria-hidden="true" className="flex flex-col gap-2">
          <span className={skeletonBlock({ className: "h-7 w-3/5" })} />
          <span className={skeletonBlock({ className: "h-4 w-full" })} />
          <span className={skeletonBlock({ className: "h-4 w-4/5" })} />
        </div>

        <div aria-hidden="true" className="flex flex-col gap-4">
          <span className={skeletonBlock({ className: "h-11 w-full" })} />
          <span className={skeletonBlock({ className: "h-11 w-full" })} />
          <span className={skeletonBlock({ className: "h-11 w-full" })} />
        </div>
      </div>

      <div aria-hidden="true" className={stepFooter()}>
        <span className={skeletonBlock({ className: "h-11 w-full sm:w-32" })} />
        <span className={skeletonBlock({ className: "h-11 w-full sm:w-20" })} />
      </div>
    </div>
  );
}
