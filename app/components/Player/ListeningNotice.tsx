"use client";

import { useTranslation } from "react-i18next";

import { Avatar } from "@components/ui/Avatar";

import { TrackCover } from "./TrackCover";
import { trackInitials } from "./helpers";
import { listeningNotice, listeningNoticeLead, roomDetail, roomText, roomTrack } from "./styles";
import type { ListeningNoticeProps } from "./types";

export function ListeningNotice({ member, onOpen }: ListeningNoticeProps) {
  const { t } = useTranslation("player");

  return (
    <button type="button" className={listeningNotice()} onClick={onOpen} data-player-listening-notice>
      <TrackCover initials={trackInitials(member.album)} tone="accent" size="card" artworkUrl={member.artworkUrl} />
      <span className={roomText()}>
        <span className={listeningNoticeLead()}>{t("listening.started", { name: member.name })}</span>
        <span className={roomTrack()}>{member.title}</span>
        <span className={roomDetail()}>
          {member.artist} · {member.album}
        </span>
      </span>
      <Avatar size="sm" imageUrl={member.avatarUrl} username={member.name} />
    </button>
  );
}
