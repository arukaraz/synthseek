"use client";

import { AccountStep } from "../steps/AccountStep";
import { DownloadsStep } from "../steps/DownloadsStep";
import { MediaConnectStep } from "../steps/MediaConnectStep";
import { MediaStep } from "../steps/MediaStep";
import { MetadataStep } from "../steps/MetadataStep";
import { SummaryStep } from "../steps/SummaryStep";
import type { SetupStepSwitchProps } from "../types";

export function SetupStepSwitch({ step, server, onGo }: SetupStepSwitchProps) {
  switch (step) {
    case "account":
      return <AccountStep />;
    case "media":
      return server ? <MediaConnectStep server={server} onGo={onGo} /> : <MediaStep onGo={onGo} />;
    case "downloads":
      return <DownloadsStep onGo={onGo} />;
    case "metadata":
      return <MetadataStep onGo={onGo} />;
    case "summary":
      return <SummaryStep onGo={onGo} />;
  }
}
