"use client";

import { EmptyState } from "@components/ui/EmptyState";
import { Inbox } from "lucide-react";
import { RequestDetailHero } from "./RequestDetailHero";
import { RequestDetailStats } from "./RequestDetailStats";
import { RequestDetailTracks } from "./RequestDetailTracks";
import { detailContainer } from "./styles";
import type { RequestDetailProps } from "./types";

export function RequestDetail({ request, onBack }: RequestDetailProps) {
  if (!request) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <EmptyState
          icon={Inbox}
          title="Select a request"
          description="Choose a request from the list to see its details."
        />
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
