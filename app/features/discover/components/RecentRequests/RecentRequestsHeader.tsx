"use client";

import { ArrowRight } from "lucide-react";
import { headerLink, headerRow } from "./styles";
import type { RecentRequestsHeaderProps } from "./types";

export function RecentRequestsHeader({ onOpen, limit }: RecentRequestsHeaderProps) {
  return (
    <div className={headerRow()}>
      <div>
        <h3 className="text-fg text-lg font-semibold">Recent requests</h3>
        <p className="text-fg/60 text-xs">{`Last ${limit} downloads`}</p>
      </div>
      <button type="button" onClick={onOpen} aria-label="Open requests page" className={headerLink()}>
        Open Requests <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
}
