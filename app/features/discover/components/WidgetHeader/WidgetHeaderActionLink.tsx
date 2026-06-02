"use client";

import { ChevronRight } from "lucide-react";

import { widgetHeaderActionLink } from "./styles";
import type { WidgetHeaderActionLinkProps } from "./types";

export function WidgetHeaderActionLink({ action }: WidgetHeaderActionLinkProps) {
  if (action.href) {
    return (
      <a
        href={action.href}
        target={action.external ? "_blank" : undefined}
        rel={action.external ? "noopener noreferrer" : undefined}
        aria-label={action.ariaLabel ?? action.label}
        className={widgetHeaderActionLink()}
      >
        {action.label}
        <ChevronRight className="size-3" aria-hidden />
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={action.onClick}
      aria-label={action.ariaLabel ?? action.label}
      className={widgetHeaderActionLink()}
    >
      {action.label}
      <ChevronRight className="size-3" aria-hidden />
    </button>
  );
}
