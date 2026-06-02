"use client";

import { Trophy } from "lucide-react";
import Link from "next/link";

import { WidgetHeader } from "../WidgetHeader";
import { glassPanelCard } from "../styles";
import { EMPTY_COPY, SETTINGS_HREF } from "./constants";
import { emptyLink, emptyPanel, emptyText } from "./styles";
import type { TopTracksEmptyProps } from "./types";

export function TopTracksEmpty({ reason }: TopTracksEmptyProps) {
  const copy = EMPTY_COPY[reason];
  return (
    <section className={glassPanelCard({ height: "auto" })} aria-labelledby="top-tracks-heading">
      <WidgetHeader
        icon={Trophy}
        title="Top Tracks"
        subtitle="Most played · all time · Last.fm"
        titleId="top-tracks-heading"
      />
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
