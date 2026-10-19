import { glassPanelCard } from "@components/ui/styles";
import { WidgetHeader } from "@components/WidgetHeader";
import { cn } from "@utils/cn";

import { analyticsTile, tileBody, tileNote, tileSkeleton } from "./styles";
import type { AnalyticsTileProps } from "./types";

export function AnalyticsTile({ icon, title, subtitle, info, titleId, loading, note, children }: AnalyticsTileProps) {
  return (
    <section className={cn(glassPanelCard(), analyticsTile())} aria-labelledby={titleId}>
      <WidgetHeader icon={icon} title={title} subtitle={subtitle} info={info} titleId={titleId} headingLevel="h3" />
      {loading ? (
        <div className={tileSkeleton()} />
      ) : note ? (
        <p className={tileNote()}>{note}</p>
      ) : (
        <div className={tileBody()}>{children}</div>
      )}
    </section>
  );
}
