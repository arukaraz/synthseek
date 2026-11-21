"use client";

import { useEffect } from "react";

import { followThemeIcon } from "./favicon";

export function ThemeFavicon() {
  useEffect(() => followThemeIcon(document), []);
  return null;
}
