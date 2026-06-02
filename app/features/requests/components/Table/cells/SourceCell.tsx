"use client";

import { ContentType } from "@api/__generated__/types";
import { sourceCellButton } from "../styles";
import type { SourceCellProps } from "../types";

export function SourceCell({ item, onSelect }: SourceCellProps) {
  const { id, name, contentType } = item.parent;
  const selectable = contentType === ContentType.enum.album || contentType === ContentType.enum.playlist;

  if (!selectable) {
    return <span className="text-fg/60 truncate text-sm">{name}</span>;
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onSelect(id);
      }}
      title={`Show only tracks from ${name}`}
      className={sourceCellButton()}
    >
      {name}
    </button>
  );
}
