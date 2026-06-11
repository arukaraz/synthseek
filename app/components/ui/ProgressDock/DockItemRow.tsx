"use client";

import { Spinner } from "@components/ui/Spinner";
import { Check, Circle, X } from "lucide-react";

import { dockItemIcon, dockItemName, dockItemNameBlock, dockItemReason, dockItemRow } from "./styles";
import type { DockItemRowProps } from "./types";

export function DockItemRow({ item, reduced, label, reasonLabel }: DockItemRowProps) {
  return (
    <div className={dockItemRow({ importing: item.state === "importing" })}>
      <span className={dockItemIcon()} aria-hidden="true">
        {item.state === "done" ? <Check className="text-success size-4" /> : null}
        {item.state === "skipped" ? <Check className="text-fg/30 size-4" /> : null}
        {item.state === "failed" ? <X className="text-error size-4" /> : null}
        {item.state === "pending" ? <Circle className="fill-fg/30 text-fg/30 size-2" /> : null}
        {item.state === "importing" ? (
          reduced ? (
            <Circle className="fill-sync text-sync size-2" />
          ) : (
            <Spinner size="sm" decorative />
          )
        ) : null}
      </span>
      <span className={dockItemNameBlock()}>
        <span className={dockItemName()} title={item.name}>
          {item.name}
        </span>
        {item.state === "failed" ? (
          <span className={dockItemReason()} title={reasonLabel}>
            {reasonLabel}
          </span>
        ) : null}
      </span>
      <span className="sr-only">{label}</span>
    </div>
  );
}
