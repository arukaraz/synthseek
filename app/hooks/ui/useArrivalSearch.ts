"use client";

import { useState } from "react";

export function useArrivalSearch(): string {
  const [search] = useState(() => (typeof window === "undefined" ? "" : window.location.search));
  return search;
}
