"use client";

import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { usePlexLinkFlow } from "@hooks/api/mutations/auth/usePlexLinkFlow";
import { useInvalidateLibrarySources } from "@hooks/api/queries/library-source/useInvalidateLibrarySources";
import { usePlexPinPopup } from "@hooks/ui/usePlexPinPopup";
import { trpc } from "@utils/trpc";

export function usePlexLink() {
  const { t } = useTranslation("settings");
  const utils = trpc.useUtils();
  const invalidateLibrarySources = useInvalidateLibrarySources();
  const { start: startFlow, poll } = usePlexLinkFlow();

  return usePlexPinPopup({
    start: startFlow,
    poll,
    onResolved: async (resolved) => {
      invalidateLibrarySources();
      await Promise.all([utils.auth.me.invalidate(), utils.playback.sources.accounts.invalidate()]);
      toast.success(
        resolved.plexUsername
          ? t("profile.connected.plex.linkedAs", { username: resolved.plexUsername })
          : t("profile.connected.plex.linkedFallback")
      );
    },
    timeoutMessage: t("profile.connected.plex.linkTimedOut"),
    errorFallbackMessage: t("profile.connected.plex.linkFailed"),
  });
}
