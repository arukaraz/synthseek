"use client";

import { ProviderMark, providerTone } from "@components/LibrarySourceModal";
import { cn } from "@utils/cn";
import { isPlaybackServerKey } from "@utils/playback-servers";
import { HardDrive } from "lucide-react";

import { sourceMark } from "./styles";
import type { SourceMarkProps } from "./types";

export function SourceMark({ sourceKey }: SourceMarkProps) {
  if (isPlaybackServerKey(sourceKey)) {
    return (
      <span className={cn(sourceMark(), providerTone({ provider: sourceKey }))} aria-hidden>
        <ProviderMark provider={sourceKey} size={16} />
      </span>
    );
  }
  return (
    <span className={sourceMark({ local: true })} aria-hidden>
      <HardDrive className="size-3.5" />
    </span>
  );
}
