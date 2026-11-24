"use client";

import { Trophy } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { SOURCE_NAMES } from "@components/SourceBadge";
import { glassPanelCard } from "@components/ui/styles";
import { WidgetHeader } from "@components/WidgetHeader";

import { PROVIDER_SETTINGS_HREFS } from "../constants";
import { widgetEmptyLink, widgetEmptyPanel, widgetEmptyText } from "../styles";
import { emptyTextKey } from "./helpers";
import type { TopTracksEmptyProps } from "./types";

export function TopTracksEmpty({ reason, info, provider }: TopTracksEmptyProps) {
  const { t } = useTranslation("discover");
  const name = SOURCE_NAMES[provider];
  const headingId = `top-tracks-heading-${provider}`;

  return (
    <section className={glassPanelCard({ height: "auto" })} aria-labelledby={headingId}>
      <WidgetHeader
        icon={Trophy}
        title={t("topTracks.title")}
        subtitle={t("topTracks.subtitle", { provider: name })}
        titleId={headingId}
        info={info}
      />
      <div className={widgetEmptyPanel()}>
        <p className={widgetEmptyText()}>{t(emptyTextKey(reason), { provider: name })}</p>
        {reason === "unlinked" ? (
          <Link href={PROVIDER_SETTINGS_HREFS[provider]} className={widgetEmptyLink()}>
            {t("topTracks.empty.ctaConfigure", { provider: name })}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
