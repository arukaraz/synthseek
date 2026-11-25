import { SourceBadge } from "@components/SourceBadge";

import { sourcePills } from "./styles";
import type { SourcePillsProps } from "./types";

export function SourcePills({ pills, inactive = false }: SourcePillsProps) {
  return (
    <span className={sourcePills()}>
      {pills.map((pill) => (
        <SourceBadge key={pill.source} source={pill.source} label={pill.label} inactive={inactive} />
      ))}
    </span>
  );
}
