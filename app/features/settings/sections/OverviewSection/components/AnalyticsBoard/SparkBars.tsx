import { SPARK_VIEWBOX } from "./constants";
import { sparkBars } from "./helpers";
import { spark, sparkBar } from "./styles";
import type { SparkProps } from "./types";

export function SparkBars({ values, fill = false }: SparkProps) {
  return (
    <svg className={spark({ fill })} viewBox={SPARK_VIEWBOX} preserveAspectRatio="none" aria-hidden>
      {sparkBars(values).map((bar) => (
        <rect
          key={bar.x}
          className={sparkBar({ last: bar.last })}
          x={bar.x}
          y={bar.y}
          width={bar.width}
          height={bar.height}
          rx={1}
        />
      ))}
    </svg>
  );
}
