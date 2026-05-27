import { Moon, Sparkles, Sun, Waves } from "lucide-react";

export const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "midnight", label: "Midnight", icon: Sparkles },
  { value: "ocean", label: "Ocean", icon: Waves },
] as const;
