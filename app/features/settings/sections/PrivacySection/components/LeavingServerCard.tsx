"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

import { inlineLink } from "@components/HashLink";
import { InfoTooltip } from "@components/ui/InfoTooltip";
import { useListeningConnections, usePlaybackSourceAccounts } from "@hooks/api";
import { PLAYBACK_SERVER_NAMES } from "@utils/playback-servers";

import { Pill } from "../../../components/Pill";
import { SettingsCard } from "../../../components/SettingsCard";
import { CONNECTIONS_HREF, LEAVING_STATUS_KEYS, SCROBBLE_LABEL_KEYS } from "../constants";
import { leavingRows } from "../helpers";
import { leavingLabel, leavingList, leavingRow, privacyFooter } from "../styles";

export function LeavingServerCard() {
  const { t } = useTranslation("settings");
  const connections = useListeningConnections();
  const accounts = usePlaybackSourceAccounts();
  const rows = leavingRows(connections.data ?? [], accounts.data ?? []);

  return (
    <SettingsCard
      title={t("privacy.leaving.title")}
      titleTrailing={<InfoTooltip description={t("privacy.leaving.description")} />}
      anchor="privacy.leaving"
    >
      {rows.length > 0 ? (
        <ul className={leavingList()}>
          {rows.map((row) => (
            <li key={row.id} className={leavingRow()}>
              <span className={leavingLabel()}>
                {row.kind === "scrobble"
                  ? t(SCROBBLE_LABEL_KEYS[row.id])
                  : t("privacy.leaving.server", { server: PLAYBACK_SERVER_NAMES[row.id] })}
              </span>
              <Pill tone={row.status === "on" ? "success" : "muted"}>{t(LEAVING_STATUS_KEYS[row.status])}</Pill>
            </li>
          ))}
        </ul>
      ) : null}
      <div className={privacyFooter()}>
        <Link href={CONNECTIONS_HREF} className={inlineLink()}>
          {t("privacy.leaving.manage")}
        </Link>
      </div>
    </SettingsCard>
  );
}
