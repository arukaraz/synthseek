"use client";

import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { usePlexLinkFlow } from "@hooks/api/mutations/auth/usePlexLinkFlow";
import { usePlexPinPopup } from "@hooks/ui/usePlexPinPopup";
import { trpc } from "@utils/trpc";

export function usePlexLink() {
  const { t } = useTranslation("settings");
  const utils = trpc.useUtils();
  const { start: startFlow, poll } = usePlexLinkFlow();

  return usePlexPinPopup({
    start: startFlow,
    poll,
    onResolved: async (resolved) => {
      await utils.auth.me.invalidate();
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
