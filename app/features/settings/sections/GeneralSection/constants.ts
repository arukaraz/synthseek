import { Moon, Sparkles, Waves } from "lucide-react";

import type { Theme } from "@theme/ThemeProvider";

import type { RovingNavKey, ThemeOption } from "./types";

export const THEME_OPTIONS: ReadonlyArray<ThemeOption> = [
  { value: "dark", label: "Synthseek", icon: Moon, preview: "dark" },
  { value: "midnight", label: "Midnight", icon: Sparkles, preview: "midnight" },
  { value: "ocean", label: "Ocean", icon: Waves, preview: "ocean" },
];

export const FEATURED_THEME: Theme = "dark";

export const ROVING_KEYS: ReadonlyArray<RovingNavKey> = [
  "ArrowRight",
  "ArrowDown",
  "ArrowLeft",
  "ArrowUp",
  "Home",
  "End",
];
