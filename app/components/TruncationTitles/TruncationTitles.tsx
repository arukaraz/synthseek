"use client";

import { useEffect } from "react";

import { handleTruncationHover } from "@utils/truncation-title";

export function TruncationTitles() {
  useEffect(() => {
    document.addEventListener("mouseover", handleTruncationHover, true);
    return () => document.removeEventListener("mouseover", handleTruncationHover, true);
  }, []);

  return null;
}
