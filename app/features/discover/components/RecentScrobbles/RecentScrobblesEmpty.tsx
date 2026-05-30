"use client";

import { Activity } from "lucide-react";
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
import type { RecentScrobblesEmptyProps } from "./types";

export function RecentScrobblesEmpty({ reason }: RecentScrobblesEmptyProps) {
  const copy = EMPTY_COPY[reason];
  return (
    <section className={glassPanelCard({ height: "auto" })}>
      <header className={widgetHeader()}>
        <div className={headerTitleStack()}>
          <div className={headerTitleRow()}>
            <span className={sectionIcon()}>
              <Activity className="size-4" />
            </span>
            <h2 className={widgetTitle()}>Recent Scrobbles</h2>
          </div>
          <p className={widgetSub()}>Last.FM</p>
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
