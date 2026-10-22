"use client";

import { CoverArt } from "../WidgetRow/CoverArt";
import { leader, leaderBadge, leaderBody, leaderCover, leaderShade } from "./styles";
import type { WidgetLeaderProps } from "./types";

export function WidgetLeader({ cover, seed, badge: { icon: Icon, label }, children }: WidgetLeaderProps) {
  return (
    <article className={leader()}>
      <span className={leaderCover()}>
        <CoverArt src={cover} seed={seed} sizes="280px" />
      </span>
      <span className={leaderShade()} aria-hidden />
      <span className={leaderBadge()}>
        <Icon />
        {label}
      </span>
      <div className={leaderBody()}>{children}</div>
    </article>
  );
}
