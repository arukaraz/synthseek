import { sourceBadge, sourceDot } from "./styles";
import type { SourceBadgeProps } from "./types";

export function SourceBadge({ source, label, inactive = false }: SourceBadgeProps) {
  return (
    <span className={sourceBadge({ inactive })} data-source-badge={source} data-inactive={inactive || undefined}>
      <span className={sourceDot({ inactive })} data-source={source} aria-hidden />
      {label}
    </span>
  );
}
