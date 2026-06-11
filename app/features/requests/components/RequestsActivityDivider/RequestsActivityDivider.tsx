"use client";

import { ActivityDivider } from "@components/ui/ActivityDivider";

import { useActivityState } from "../../hooks/useActivityState";
import type { RequestsActivityDividerProps } from "./types";

export function RequestsActivityDivider({ children }: RequestsActivityDividerProps) {
  const { state, synced, total } = useActivityState();

  return (
    <ActivityDivider state={state} value={synced} max={total}>
      {children}
    </ActivityDivider>
  );
}
