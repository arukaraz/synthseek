"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { cn } from "@utils/cn";

import { pageIntro, pageIntroCollapseInner, pageIntroCollapseRegion, pageIntroExpandToggle } from "../../styles";

export function EngineIntro() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={pageIntro()}>
      <p>Advanced controls for the search → download → import pipeline.</p>
      <div className={pageIntroCollapseRegion({ expanded })}>
        <div className={pageIntroCollapseInner()}>
          <p>
            Defaults are tuned to a balanced sweet spot that works well for most setups, change them only if you know
            what you are doing.
          </p>
          <p>
            When in doubt, leave them as-is or if tracks start failing after a change, hit{" "}
            <span className="text-fg/80 font-medium">Reset to defaults</span> on the affected card.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className={pageIntroExpandToggle()}
      >
        {expanded ? "Show less" : "Show more"}
        <ChevronDown className={cn("size-3.5 transition-transform duration-200", expanded && "rotate-180")} />
      </button>
    </div>
  );
}
