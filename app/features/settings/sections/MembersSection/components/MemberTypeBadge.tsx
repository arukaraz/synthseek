import { pill } from "../styles";
import type { MemberTypeBadgeProps } from "../types";

export function MemberTypeBadge({ isPlexUser }: MemberTypeBadgeProps) {
  return (
    <span className={pill({ tone: isPlexUser ? "plex" : "local" })}>{isPlexUser ? "Plex User" : "Local User"}</span>
  );
}
