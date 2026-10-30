"use client";

import { FadeScroll } from "@components/FadeScroll";

import { WidgetRow } from "../WidgetRow/WidgetRow";
import { BLOCK_LIMITS, MOVE_ICONS } from "./constants";
import { moveDirection, moveText } from "./helpers";
import { blockBody, blockList, moveBadge } from "./styles";
import type { WidgetBlockProps } from "./types";

export function RankingMovesBlock({ items, size, accent, controls }: WidgetBlockProps) {
  return (
    <div data-acc={accent} className={blockBody()}>
      <FadeScroll>
        <ol className={blockList({ wide: size === "L" })}>
          {items.slice(0, BLOCK_LIMITS.rankingMoves[size]).map((item, index) => {
            const direction = item.move ? moveDirection(item.move) : null;
            const Icon = direction ? MOVE_ICONS[direction] : null;
            return (
              <WidgetRow
                key={item.key}
                cover={item.cover}
                seed={item.key}
                title={item.title}
                subtitle={item.subtitle}
                lead={index + 1}
                trailing={
                  item.move && direction && Icon ? (
                    <span className={moveBadge({ direction })}>
                      <Icon aria-hidden />
                      {moveText(item.move)}
                    </span>
                  ) : undefined
                }
                {...controls(item)}
              />
            );
          })}
        </ol>
      </FadeScroll>
    </div>
  );
}
