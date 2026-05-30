"use client";

import { Trophy } from "lucide-react";

import { glassPanelCard } from "../styles";
import { SKELETON_LIST_PLACEHOLDERS } from "./constants";
import {
  body,
  headerTitleRow,
  headerTitleStack,
  list,
  sectionIcon,
  skeletonHero,
  skeletonRow,
  widgetHeader,
  widgetSub,
  widgetTitle,
} from "./styles";

export function TopTracksSkeleton() {
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
      <div className={body()}>
        <div className={skeletonHero()} />
        <div className={list()}>
          {SKELETON_LIST_PLACEHOLDERS.map((i) => (
            <div key={i} className={skeletonRow()} />
          ))}
        </div>
      </div>
    </section>
  );
}
