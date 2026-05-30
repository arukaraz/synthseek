"use client";

import { Trophy } from "lucide-react";
import Link from "next/link";

import { glassPanelCard } from "../styles";
import { EMPTY_COPY, SETTINGS_HREF } from "./constants";
import {
  emptyLink,
  emptyPanel,
  emptyText,
  headerTitleRow,
  headerTitleStack,
  sectionIcon,
  widgetHeader,
  widgetSub,
  widgetTitle,
} from "./styles";
import type { TopTracksEmptyProps } from "./types";

export function TopTracksEmpty({ reason }: TopTracksEmptyProps) {
  const copy = EMPTY_COPY[reason];
  return (
    <section className={glassPanelCard({ height: "auto" })}>
      <header className={widgetHeader()}>
        <div className={headerTitleStack()}>
          <div className={headerTitleRow()}>
            <span className={sectionIcon()}>
              <Trophy className="size-4" />
            </span>
            <h2 className={widgetTitle()}>Top Tracks</h2>
          </div>
          <p className={widgetSub()}>Most played · all time · Last.fm</p>
        </div>
      </header>
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
