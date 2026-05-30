"use client";

import { Activity } from "lucide-react";

import { glassPanelCard } from "../styles";
import { SKELETON_PLACEHOLDERS } from "./constants";
import {
  headerTitleRow,
  headerTitleStack,
  rail,
  railWrap,
  sectionIcon,
  skeletonNode,
  widgetHeader,
  widgetSub,
  widgetTitle,
} from "./styles";

export function RecentScrobblesSkeleton() {
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
      <div className={railWrap()}>
        <div className={rail()}>
          {SKELETON_PLACEHOLDERS.map((i) => (
            <div key={i} className={skeletonNode()} />
          ))}
        </div>
      </div>
    </section>
  );
}
