"use client";

import { motion } from "framer-motion";

import { segmentTab, segmentTabCount, segmentTabUnderline, segmentTabsRoot } from "./styles";
import type { SegmentTabsProps } from "./types";

export function SegmentTabs<TValue extends string>({
  items,
  value,
  onValueChange,
  layoutId,
  ariaLabel,
}: SegmentTabsProps<TValue>) {
  return (
    <div role="tablist" aria-label={ariaLabel} className={segmentTabsRoot()}>
      {items.map((item) => {
        const isActive = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={segmentTab({ active: isActive })}
            onClick={() => onValueChange(item.value)}
          >
            <span>{item.label}</span>
            {item.count !== undefined ? (
              <span className={segmentTabCount({ active: isActive })}>{item.count}</span>
            ) : null}
            {isActive ? <motion.span layoutId={layoutId} className={segmentTabUnderline()} /> : null}
          </button>
        );
      })}
    </div>
  );
}
