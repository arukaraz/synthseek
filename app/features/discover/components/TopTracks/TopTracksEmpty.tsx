"use client";

import { Trophy } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { WidgetHeader } from "../WidgetHeader";
import { glassPanelCard } from "../styles";
import { EMPTY_CTA, SETTINGS_HREF } from "./constants";
import { emptyTextKey } from "./helpers";
import { emptyLink, emptyPanel, emptyText } from "./styles";
import type { TopTracksEmptyProps } from "./types";

export function TopTracksEmpty({ reason }: TopTracksEmptyProps) {
  const { t } = useTranslation("discover");
  const cta = EMPTY_CTA[reason];
  const ctaLabel = cta === "open-settings" ? t("topTracks.empty.ctaOpenSettings") : t("topTracks.empty.ctaConfigure");

  return (
    <section className={glassPanelCard({ height: "auto" })} aria-labelledby="top-tracks-heading">
      <WidgetHeader
        icon={Trophy}
        title={t("topTracks.title")}
        subtitle={t("topTracks.subtitle")}
        titleId="top-tracks-heading"
      />
      <div className={emptyPanel()}>
        <p className={emptyText()}>{t(emptyTextKey(reason))}</p>
        {cta ? (
          <Link href={SETTINGS_HREF} className={emptyLink()}>
            {ctaLabel}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
