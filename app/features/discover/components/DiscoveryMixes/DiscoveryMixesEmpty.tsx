"use client";

import { Library } from "lucide-react";
import Link from "next/link";

import { glassPanelCard } from "../styles";
import { DISCOVERY_SETTINGS_HREF, EMPTY_STATE_COPY } from "./constants";
import {
  emptyPanel,
  emptyPanelLink,
  emptyPanelText,
  widgetHeader,
  widgetIcon,
  widgetSubtitle,
  widgetTitle,
} from "./styles";
import type { DiscoveryMixesEmptyProps } from "./types";

export function DiscoveryMixesEmpty({ reason }: DiscoveryMixesEmptyProps) {
  const copy = EMPTY_STATE_COPY[reason];

  return (
    <section className={glassPanelCard({ height: "auto" })}>
      <header className={widgetHeader()}>
        <span className={widgetIcon()}>
          <Library className="size-4" />
        </span>
        <div>
          <h2 className={widgetTitle()}>Discover Mixes</h2>
          <p className={widgetSubtitle()}>ListenBrainz</p>
        </div>
      </header>
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
