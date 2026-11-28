"use client";

import { useTranslation } from "react-i18next";

import { setupAsk, skeletonBlock } from "../styles";

export function SetupSkeleton() {
  const { t } = useTranslation("setup");

  return (
    <div role="status" aria-busy="true" className={setupAsk()}>
      <span className="sr-only">{t("shell.loading")}</span>
      <div aria-hidden="true" className="flex flex-col gap-4">
        <span className={skeletonBlock({ className: "h-9 w-40" })} />
        <span className={skeletonBlock({ className: "h-3 w-24" })} />
        <span className={skeletonBlock({ className: "h-10 w-4/5" })} />
        <span className={skeletonBlock({ className: "h-11 w-full" })} />
        <span className={skeletonBlock({ className: "h-11 w-full" })} />
      </div>
    </div>
  );
}
