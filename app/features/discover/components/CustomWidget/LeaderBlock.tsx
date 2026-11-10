"use client";

import { Play, Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";

import { FadeScroll } from "@components/FadeScroll";
import { RequestSplitButton } from "@components/RequestSplitButton";

import { WidgetLeader } from "../WidgetLeader/WidgetLeader";
import { leaderFrame, leaderLayout, leaderSubtitle, leaderTitle } from "../WidgetLeader/styles";
import { WidgetRow } from "../WidgetRow/WidgetRow";
import { BLOCK_LIMITS } from "./constants";
import { itemMeta } from "./helpers";
import { blockList, blockValue, leaderAction, leaderLink } from "./styles";
import type { WidgetBlockProps } from "./types";

export function LeaderBlock({ items, size, accent, controls }: WidgetBlockProps) {
  const { t } = useTranslation("discover");
  const [first, ...rest] = items;
  if (!first) return null;
  const { onSelect, coverAction } = controls(first);
  const others = rest.slice(0, BLOCK_LIMITS.leader[size]);

  return (
    <div data-acc={accent} className={leaderFrame()}>
      <div className={leaderLayout()}>
        <WidgetLeader
          cover={first.cover}
          seed={first.key}
          badge={{ icon: Trophy, label: t("customWidget.leader") }}
          fill={others.length === 0}
        >
          {onSelect ? (
            <button type="button" className={leaderLink()} onClick={onSelect}>
              {first.title}
            </button>
          ) : (
            <span className={leaderTitle()}>{first.title}</span>
          )}
          <span className={leaderSubtitle()}>{itemMeta(first)}</span>
          {coverAction?.kind === "play" ? (
            <button
              type="button"
              className={leaderAction()}
              aria-label={coverAction.label}
              onClick={coverAction.onClick}
            >
              <Play />
              {t("customWidget.play")}
            </button>
          ) : null}
          {coverAction?.kind === "request" ? (
            <RequestSplitButton
              name={coverAction.name}
              label={t("customWidget.request")}
              size="sm"
              onRequest={coverAction.onClick}
              onCustomize={coverAction.onCustomize}
            />
          ) : null}
        </WidgetLeader>
        {others.length > 0 ? (
          <FadeScroll>
            <ol className={blockList()} start={2}>
              {others.map((item, index) => (
                <WidgetRow
                  key={item.key}
                  cover={item.cover}
                  seed={item.key}
                  title={item.title}
                  subtitle={item.subtitle}
                  lead={index + 2}
                  trailing={item.value ? <span className={blockValue()}>{item.value}</span> : undefined}
                  {...controls(item)}
                />
              ))}
            </ol>
          </FadeScroll>
        ) : null}
      </div>
    </div>
  );
}
