import { SPARK_VIEWBOX } from "./constants";
import { sparkPath } from "./helpers";
import { spark, sparkArea, sparkLine } from "./styles";
import type { SparkProps } from "./types";

export function SparkLine({ values, fill = false }: SparkProps) {
  const path = sparkPath(values);

  return (
    <svg className={spark({ fill })} viewBox={SPARK_VIEWBOX} preserveAspectRatio="none" aria-hidden>
      <path className={sparkArea()} d={path.area} />
      <path className={sparkLine()} d={path.line} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
