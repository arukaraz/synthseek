import { cn } from "@utils/cn";

import { nowPlayingBars } from "./styles";
import type { NowPlayingBarsProps } from "./types";

export function NowPlayingBars({ playing, label, className }: NowPlayingBarsProps) {
  return (
    <span
      role="img"
      aria-label={label}
      data-paused={playing ? undefined : ""}
      className={cn(nowPlayingBars(), className)}
    >
      <span />
      <span />
      <span />
    </span>
  );
}
