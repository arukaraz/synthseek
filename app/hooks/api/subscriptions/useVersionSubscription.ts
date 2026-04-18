import { trpc } from "@utils/trpc";
import { useState } from "react";

interface VersionCheckEvent {
  currentVersion: string;
  latestVersion: string;
  message: string;
}

interface VersionState {
  updateAvailable: boolean;
  latestVersion: string | null;
  currentVersion: string;
}

const BUILD_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0";

export function useVersionSubscription(): VersionState {
  const [latestVersion, setLatestVersion] = useState<string | null>(null);

  trpc.system.onVersionUpdate.useSubscription(undefined, {
    onData: (event: VersionCheckEvent) => {
      setLatestVersion(event.latestVersion);
    },
  });

  return {
    updateAvailable: latestVersion !== null && latestVersion !== BUILD_VERSION,
    latestVersion,
    currentVersion: BUILD_VERSION,
  };
}
