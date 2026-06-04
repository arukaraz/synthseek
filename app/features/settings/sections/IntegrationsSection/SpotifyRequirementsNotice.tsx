"use client";

import { Trans, useTranslation } from "react-i18next";

import { Notice } from "@components/ui/Notice";

import { noticeLink, noticeList } from "./styles";

export function SpotifyRequirementsNotice() {
  const { t } = useTranslation("settings");

  return (
    <Notice variant="warning" title={t("metadata.spotifyRequirements.title")} collapsible defaultOpen={false}>
      <ul className={noticeList()}>
        <li>
          •{" "}
          <Trans
            t={t}
            i18nKey="metadata.spotifyRequirements.ownerPremium"
            components={{
              strong: <strong />,
              dashboard: (
                <a
                  href="https://developer.spotify.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className={noticeLink()}
                />
              ),
            }}
          />
        </li>
        <li>
          • <Trans t={t} i18nKey="metadata.spotifyRequirements.userManagement" components={{ strong: <strong /> }} />
        </li>
        <li>
          •{" "}
          <Trans t={t} i18nKey="metadata.spotifyRequirements.connectorsNoPremium" components={{ strong: <strong /> }} />
        </li>
      </ul>
    </Notice>
  );
}
