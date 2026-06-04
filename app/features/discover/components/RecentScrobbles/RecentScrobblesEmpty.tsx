"use client";

import { Activity } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { WidgetHeader } from "../WidgetHeader";
import { glassPanelCard } from "../styles";
import { EMPTY_CTA, SETTINGS_HREF } from "./constants";
import { emptyTextKey } from "./helpers";
import { emptyLink, emptyPanel, emptyText } from "./styles";
import type { RecentScrobblesEmptyProps } from "./types";

export function RecentScrobblesEmpty({ reason }: RecentScrobblesEmptyProps) {
  const { t } = useTranslation("discover");
  const cta = EMPTY_CTA[reason];
  const ctaLabel =
    cta === "open-settings" ? t("recentScrobbles.empty.ctaOpenSettings") : t("recentScrobbles.empty.ctaConfigure");

  return (
    <section className={glassPanelCard({ height: "auto" })} aria-labelledby="recent-scrobbles-heading">
      <WidgetHeader
        icon={Activity}
        title={t("recentScrobbles.title")}
        subtitle={t("recentScrobbles.subtitle")}
        titleId="recent-scrobbles-heading"
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
