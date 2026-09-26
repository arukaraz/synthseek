"use client";

import { PROVIDER_MARKS } from "../constants";
import type { ProviderMarkProps } from "./types";

export function ProviderMark({ provider, size }: ProviderMarkProps) {
  const Mark = PROVIDER_MARKS[provider];
  return <Mark size={size} />;
}
