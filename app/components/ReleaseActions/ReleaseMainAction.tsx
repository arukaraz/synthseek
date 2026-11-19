"use client";

import { ExternalLink, Play } from "lucide-react";
import { useTranslation } from "react-i18next";

import { releaseStateInfo } from "@components/ReleaseState";
import { RequestSplitButton } from "@components/RequestSplitButton";
import { Button } from "@components/ui/Button";
import { useMyQuota } from "@hooks/api/queries/useMyQuota";

import { isQuotaFull } from "./helpers";
import { useReleaseActions } from "./hooks/useReleaseActions";
import { releaseActionButton } from "./styles";
import type { ReleaseMainActionProps } from "./types";

export function ReleaseMainAction({ album, state, autoRequest, compact = false }: ReleaseMainActionProps) {
  const { t } = useTranslation("follows");
  const actions = useReleaseActions();
  const quota = useMyQuota();
  const { action } = releaseStateInfo(state, autoRequest);

  if (action === "request") {
    const locked = state === "quota_skipped" && isQuotaFull(quota.data);
    return (
      <RequestSplitButton
        name={album.title}
        size="sm"
        label={compact ? undefined : t("action.request")}
        disabled={locked}
        disabledReason={t("action.quotaReached")}
        onRequest={() => actions.request(album, "direct")}
        onCustomize={() => actions.request(album, "customize")}
      />
    );
  }

  if (action === "play") {
    const label = t("action.play");
    return (
      <Button
        variant="secondary"
        size="sm"
        className={releaseActionButton({ compact })}
        aria-label={compact ? t("action.playNamed", { title: album.title }) : undefined}
        title={compact ? label : undefined}
        onClick={() => actions.play(album)}
      >
        <Play aria-hidden />
        {compact ? null : label}
      </Button>
    );
  }

  if (action === "viewRequest") {
    const label = t("action.viewRequest");
    return (
      <Button
        variant="secondary"
        size="sm"
        className={releaseActionButton({ compact })}
        aria-label={compact ? label : undefined}
        title={compact ? label : undefined}
        onClick={() => actions.viewRequest(album)}
      >
        <ExternalLink aria-hidden />
        {compact ? null : label}
      </Button>
    );
  }

  return null;
}
