"use client";

import { RequestSplitButton } from "@components/RequestSplitButton";

import { cardRequestAction } from "./styles";
import type { CoverRequestActionProps } from "./types";

export function CoverRequestAction({ action, placement }: CoverRequestActionProps) {
  return (
    <span className={cardRequestAction({ placement })}>
      <RequestSplitButton
        name={action.name}
        size="sm"
        onRequest={action.onClick}
        onCustomize={action.onCustomize}
        dataCy="cover-request"
      />
    </span>
  );
}
