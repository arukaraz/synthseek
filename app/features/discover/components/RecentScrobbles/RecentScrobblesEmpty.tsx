"use client";

import { Activity } from "lucide-react";
import Link from "next/link";

import { WidgetHeader } from "../WidgetHeader";
import { glassPanelCard } from "../styles";
import { EMPTY_COPY, SETTINGS_HREF } from "./constants";
import { emptyLink, emptyPanel, emptyText } from "./styles";
import type { RecentScrobblesEmptyProps } from "./types";

export function RecentScrobblesEmpty({ reason }: RecentScrobblesEmptyProps) {
  const copy = EMPTY_COPY[reason];
  return (
    <section className={glassPanelCard({ height: "auto" })} aria-labelledby="recent-scrobbles-heading">
      <WidgetHeader icon={Activity} title="Recent Scrobbles" subtitle="Last.fm" titleId="recent-scrobbles-heading" />
      <div className={emptyPanel()}>
        <p className={emptyText()}>{copy.text}</p>
        {copy.cta ? (
          <Link href={SETTINGS_HREF} className={emptyLink()}>
            {copy.cta}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
