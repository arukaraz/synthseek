"use client";

import { Reorder } from "framer-motion";

import { ChainItem } from "./ChainItem";
import { movedKey } from "./helpers";
import { chainHint, chainLabel, chainList, chainNumber } from "./styles";
import type { OrderedChainProps } from "./types";

export function OrderedChain<K extends string>({
  label,
  labelTrailing,
  fixed = [],
  entries,
  selected,
  onSelect,
  onReorder,
  hint,
}: OrderedChainProps<K>) {
  const order = entries.map((entry) => entry.key);

  return (
    <div className="flex min-w-0 flex-col">
      <div className={chainLabel()}>
        {label}
        {labelTrailing}
      </div>
      {fixed.length > 0 ? (
        <ol className={chainList()}>
          {fixed.map((entry, index) => (
            <ChainItem
              key={entry.key}
              entry={entry}
              badge={
                entry.mark ?? <span className={chainNumber({ selected: entry.key === selected })}>{index + 1}</span>
              }
              selected={entry.key === selected}
              reorderable={false}
              onSelect={() => onSelect(entry.key)}
            />
          ))}
        </ol>
      ) : null}
      <Reorder.Group
        axis="y"
        values={order}
        onReorder={onReorder}
        as="ol"
        className={chainList({ joined: fixed.length > 0 })}
      >
        {entries.map((entry, index) => (
          <ChainItem
            key={entry.key}
            entry={entry}
            badge={
              entry.mark ?? (
                <span className={chainNumber({ selected: entry.key === selected })}>{fixed.length + index + 1}</span>
              )
            }
            selected={entry.key === selected}
            reorderable
            onSelect={() => onSelect(entry.key)}
            onMoveUp={index > 0 ? () => onReorder(movedKey(order, entry.key, -1)) : undefined}
            onMoveDown={index < entries.length - 1 ? () => onReorder(movedKey(order, entry.key, 1)) : undefined}
          />
        ))}
      </Reorder.Group>
      <p className={chainHint()}>{hint}</p>
    </div>
  );
}
