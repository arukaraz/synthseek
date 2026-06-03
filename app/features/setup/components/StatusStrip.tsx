"use client";

import { cn } from "@utils/cn";

import { statusStrip, statusStripBody, statusStripGlyph } from "../styles";
import type { StatusStripProps } from "../types";
import { STATUS_STRIP_GLYPH } from "./constants";

export function StatusStrip({ tone, message, live, action, className }: StatusStripProps) {
  const Glyph = STATUS_STRIP_GLYPH[tone];
  const role = tone === "error" ? "alert" : "status";
  const ariaLive = live ?? (tone === "error" ? "assertive" : "polite");

  return (
    <div role={role} aria-live={ariaLive} className={cn(statusStrip({ tone }), className)}>
      <Glyph aria-hidden="true" className={statusStripGlyph()} />
      <span className={statusStripBody()}>
        <span>{message}</span>
        {action ? action : null}
      </span>
    </div>
  );
}
