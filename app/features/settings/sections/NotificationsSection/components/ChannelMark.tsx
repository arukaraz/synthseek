"use client";

import { CHANNEL_GLYPHS } from "../constants";
import { channelMark, channelMarkGlyph } from "../styles";
import type { ChannelMarkProps } from "../types";

export function ChannelMark({ channel, size }: ChannelMarkProps) {
  const glyph = CHANNEL_GLYPHS[channel];

  return (
    <span className={channelMark({ channel, size })} aria-hidden>
      {glyph.kind === "path" ? (
        <svg viewBox="0 0 24 24" fill="currentColor" className={channelMarkGlyph({ size })}>
          <path d={glyph.d} fillRule="evenodd" />
        </svg>
      ) : (
        <glyph.icon className={channelMarkGlyph({ size })} />
      )}
    </span>
  );
}
