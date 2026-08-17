"use client";

import { EmptyState } from "@components/ui/EmptyState";
import { useRequestDetail } from "@hooks/api";
import { Inbox } from "lucide-react";
import { useTranslation } from "react-i18next";
import { RequestDetailHero } from "./RequestDetailHero";
import { RequestDetailStats } from "./RequestDetailStats";
import { RequestDetailTracks } from "./RequestDetailTracks";
import { detailContainer } from "./styles";
import type { RequestDetailProps } from "./types";

export function RequestDetail({ request, onBack }: RequestDetailProps) {
  const { t } = useTranslation("requests");
  const {
    data: detail,
    isError,
    refetch,
  } = useRequestDetail({
    id: request?.id ?? null,
    contentType: request?.contentType ?? null,
  });

  if (!request) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <EmptyState icon={Inbox} title={t("emptyState.selectTitle")} description={t("emptyState.selectDescription")} />
      </div>
    );
  }

  const isCurrent = detail?.id === request.id;
  const tracks = isCurrent ? detail.tracks : [];
  const tracksUnavailable = (isError || detail === null) && !isCurrent;
  const isResolvingTracks = !tracksUnavailable && !isCurrent;

  return (
    <div className={detailContainer()} data-cy="request-detail">
      <RequestDetailHero request={request} tracks={tracks} onBack={onBack} />
      <RequestDetailStats request={request} tracks={tracks} isResolving={isResolvingTracks || tracksUnavailable} />
      <RequestDetailTracks
        request={request}
        tracks={tracks}
        isResolving={isResolvingTracks}
        hasFailed={tracksUnavailable}
        onRetryLoad={() => void refetch()}
      />
    </div>
  );
}
