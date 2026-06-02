"use client";

import { Library } from "lucide-react";
import Link from "next/link";

import { WidgetHeader } from "../WidgetHeader";
import { glassPanelCard } from "../styles";
import { DISCOVERY_SETTINGS_HREF, EMPTY_STATE_COPY } from "./constants";
import { emptyPanel, emptyPanelLink, emptyPanelText } from "./styles";
import type { DiscoveryMixesEmptyProps } from "./types";

export function DiscoveryMixesEmpty({ reason }: DiscoveryMixesEmptyProps) {
  const copy = EMPTY_STATE_COPY[reason];

  return (
    <section className={glassPanelCard({ height: "auto" })} aria-labelledby="discover-mixes-heading">
      <WidgetHeader icon={Library} title="Discover Mixes" subtitle="ListenBrainz" titleId="discover-mixes-heading" />
      <div className={emptyPanel()}>
        <p className={emptyPanelText()}>{copy.text}</p>
        {copy.cta ? (
          <Link href={DISCOVERY_SETTINGS_HREF} className={emptyPanelLink()}>
            {copy.cta}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
