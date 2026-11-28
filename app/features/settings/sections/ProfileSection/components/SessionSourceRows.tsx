"use client";

import { useTranslation } from "react-i18next";

import { useLibrarySources } from "@hooks/api/queries/library-source/useLibrarySources";

import { sessionSourcesOf } from "../helpers";
import { listeningFailure } from "../styles";
import { SessionSourceRow } from "./SessionSourceRow";

export function SessionSourceRows() {
  const { t } = useTranslation("settings");
  const sources = useLibrarySources();

  if (sources.isError) {
    return <p className={listeningFailure()}>{t("profile.connected.session.loadFailed")}</p>;
  }

  return (
    <>
      {sessionSourcesOf(sources.data).map((source) => (
        <SessionSourceRow key={source.provider} source={source} />
      ))}
    </>
  );
}
