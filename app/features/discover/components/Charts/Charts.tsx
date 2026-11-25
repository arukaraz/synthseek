"use client";

import { Flame } from "lucide-react";
import { useTranslation } from "react-i18next";

import { SOURCE_NAMES } from "@components/SourceBadge";
import { WidgetFrame } from "@components/WidgetFrame";
import { useCharts } from "@hooks/api/queries/analytics/useCharts";
import { useActiveIntegrations } from "@hooks/api/queries/widgets/useActiveIntegrations";

import { useWidgetControls } from "../../hooks/useWidgetControls";
import { BUILTIN_LEADER_ACCENT } from "../constants";
import { LeaderBlock } from "../CustomWidget/LeaderBlock";
import type { BoardWidgetProps } from "../ExploreBoard/types";
import { chartItem } from "./helpers";

export function Charts({ size, info, provider = "lastfm" }: BoardWidgetProps) {
  const { t } = useTranslation("discover");
  const { data, isLoading, isError } = useCharts(provider);
  const active = useActiveIntegrations();
  const controls = useWidgetControls("request");
  const name = SOURCE_NAMES[provider];
  const inactive = active !== undefined && !active.includes(provider);
  const items = (data ?? []).map(chartItem);

  return (
    <WidgetFrame
      icon={Flame}
      title={t("charts.title")}
      subtitle={t("charts.subtitle", { provider: name })}
      info={info}
      titleId={`charts-heading-${provider}`}
      loading={isLoading}
      note={
        isError
          ? t("board.loadError")
          : inactive
            ? t("board.providerInactive", { provider: name })
            : items.length === 0
              ? t("charts.empty")
              : null
      }
    >
      <LeaderBlock
        items={items}
        size={size}
        accent={BUILTIN_LEADER_ACCENT}
        controls={controls}
        badge={t("charts.leaderBadge")}
      />
    </WidgetFrame>
  );
}
