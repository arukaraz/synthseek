import { SPARK_VIEWBOX } from "./constants";
import { sparkPath } from "./helpers";
import { spark, sparkArea, sparkLine } from "./styles";
import type { SparkProps } from "./types";

export function SparkLine({ values, fill = false, tone = "primary" }: SparkProps) {
  const path = sparkPath(values);

  return (
    <svg className={spark({ fill })} viewBox={SPARK_VIEWBOX} preserveAspectRatio="none" aria-hidden>
      <path className={sparkArea({ tone })} d={path.area} />
      <path className={sparkLine({ tone })} d={path.line} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
