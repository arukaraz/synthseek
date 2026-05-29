"use client";

import { InfoTooltip } from "@components/ui/InfoTooltip";
import { cn } from "@utils/cn";

import { cardDescription, cardHeader, cardTitle, settingsCard } from "../styles";
import { DESCRIPTION_INLINE_LIMIT } from "./constants";
import type { SettingsCardProps } from "./types";

export function SettingsCard({ title, optional, description, trailing, className, children }: SettingsCardProps) {
  const hasDescription = Boolean(description);
  const collapseAsTooltip = hasDescription && description!.length > DESCRIPTION_INLINE_LIMIT;

  return (
    <section className={cn(settingsCard(), className)}>
      <header className={cardHeader()}>
        <div className="flex flex-col gap-1">
          <h2 className={cardTitle()}>
            <span className="inline-flex items-center gap-1.5">
              {title}
              {collapseAsTooltip ? <InfoTooltip description={description!} /> : null}
            </span>
            {optional ? <span className="text-fg/60 ml-1.5 text-base font-normal">(Optional)</span> : null}
          </h2>
          {hasDescription && !collapseAsTooltip ? <p className={cardDescription()}>{description}</p> : null}
        </div>
        {trailing ? <div className="shrink-0">{trailing}</div> : null}
      </header>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}
