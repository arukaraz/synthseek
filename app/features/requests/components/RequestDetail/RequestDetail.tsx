"use client";

import { EmptyState } from "@components/ui/EmptyState";
import { Inbox } from "lucide-react";
import { useTranslation } from "react-i18next";
import { RequestDetailHero } from "./RequestDetailHero";
import { RequestDetailStats } from "./RequestDetailStats";
import { RequestDetailTracks } from "./RequestDetailTracks";
import { detailContainer } from "./styles";
import type { RequestDetailProps } from "./types";

export function RequestDetail({ request, onBack }: RequestDetailProps) {
  const { t } = useTranslation("requests");

  if (!request) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <EmptyState icon={Inbox} title={t("emptyState.selectTitle")} description={t("emptyState.selectDescription")} />
      </div>
    );
  }

  return (
    <div className={detailContainer()} data-cy="request-detail">
      <RequestDetailHero request={request} onBack={onBack} />
      <RequestDetailStats request={request} />
      <RequestDetailTracks request={request} />
    </div>
  );
}
