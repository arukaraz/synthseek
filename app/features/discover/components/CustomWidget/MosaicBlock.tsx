"use client";

import { CoverArt } from "../WidgetRow/CoverArt";
import { BLOCK_LIMITS, MOSAIC_COLUMNS, MOSAIC_ROWS } from "./constants";
import { itemMeta } from "./helpers";
import { blockBody, mosaicButton, mosaicGrid, mosaicTile, mosaicVars, visuallyHidden } from "./styles";
import type { WidgetBlockProps } from "./types";

export function MosaicBlock({ items, size, accent, controls }: WidgetBlockProps) {
  return (
    <div data-acc={accent} className={blockBody()}>
      <ul className={mosaicGrid()} style={mosaicVars(MOSAIC_COLUMNS[size], MOSAIC_ROWS)}>
        {items.slice(0, BLOCK_LIMITS.mosaic[size]).map((item) => {
          const { onSelect, coverAction } = controls(item);
          const action = coverAction?.onClick ?? onSelect;
          const label = coverAction?.label ?? item.title;
          const meta = itemMeta(item);
          const title = meta ? `${item.title} · ${meta}` : item.title;
          return (
            <li key={item.key} className={mosaicTile()} title={title}>
              <CoverArt src={item.cover} seed={item.key} sizes="160px" />
              {action ? (
                <button type="button" className={mosaicButton()} aria-label={label} onClick={action} />
              ) : (
                <span className={visuallyHidden()}>{title}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
