import { Lock, Users } from "lucide-react";

import type { PlaylistVisibilityIconProps } from "./types";

export function PlaylistVisibilityIcon({ visibility, className }: PlaylistVisibilityIconProps) {
  const Glyph = visibility === "private" ? Lock : Users;

  return <Glyph className={className} aria-hidden />;
}
