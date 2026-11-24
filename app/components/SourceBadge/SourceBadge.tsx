import { sourceBadge, sourceDot } from "./styles";
import type { SourceBadgeProps } from "./types";

export function SourceBadge({ source, label }: SourceBadgeProps) {
  return (
    <span className={sourceBadge()} data-source-badge={source}>
      <span className={sourceDot()} data-source={source} aria-hidden />
      {label}
    </span>
  );
}
