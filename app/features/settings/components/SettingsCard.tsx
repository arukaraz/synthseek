"use client";

import type { ReactNode } from "react";

import { cn } from "@utils/cn";

import { cardDescription, cardHeader, cardTitle, settingsCard } from "../styles";

interface SettingsCardProps {
  title: string;
  optional?: boolean;
  description?: string;
  trailing?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function SettingsCard({ title, optional, description, trailing, className, children }: SettingsCardProps) {
  return (
    <section className={cn(settingsCard(), className)}>
      <header className={cardHeader()}>
        <div className="flex flex-col gap-1">
          <h2 className={cardTitle()}>
            {title}
            {optional ? <span className="text-fg/60 ml-1.5 text-base font-normal">(Optional)</span> : null}
          </h2>
          {description ? <p className={cardDescription()}>{description}</p> : null}
        </div>
        {trailing ? <div className="shrink-0">{trailing}</div> : null}
      </header>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}
