"use client";

import { notice, noticeDot, noticeText } from "./styles";
import type { PlayerNoticeProps } from "./types";

export function PlayerNotice({ text, tone, chain }: PlayerNoticeProps) {
  return (
    <div className={notice({ chain })} role="status" aria-live="polite">
      <span className={noticeDot({ tone })} aria-hidden />
      <span className={noticeText()}>{text}</span>
    </div>
  );
}
