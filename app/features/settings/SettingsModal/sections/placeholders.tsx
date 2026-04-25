"use client";

import { emptyPanel, sectionSubtitle, sectionTitle } from "../styles";

interface PlaceholderPanelProps {
  title: string;
  description?: string;
  note?: string;
}

export function PlaceholderPanel({ title, description, note }: PlaceholderPanelProps) {
  return (
    <section className="flex flex-col gap-3">
      <header className="flex flex-col gap-1">
        <h2 className={sectionTitle()}>{title}</h2>
        {description && <p className={sectionSubtitle()}>{description}</p>}
      </header>
      <div className={emptyPanel()}>
        <span className="text-fg/60 text-sm">{note ?? "Coming soon."}</span>
      </div>
    </section>
  );
}
