"use client";

import { useTranslation } from "react-i18next";

import { Avatar } from "@components/ui/Avatar";

import { LISTENING_AVATAR_LIMIT } from "./constants";
import { labelled } from "./helpers";
import { listeningAvatar, listeningAvatars, listeningMore } from "./styles";
import type { ListeningAvatarsProps } from "./types";

export function ListeningAvatars({ view, actions, placement }: ListeningAvatarsProps) {
  const { t } = useTranslation("player");
  const live = view.listening.live;
  if (live.length === 0) return null;
  const shown = live.slice(0, LISTENING_AVATAR_LIMIT);
  const hidden = live.length - shown.length;

  return (
    <button
      type="button"
      className={listeningAvatars({ placement, chain: view.chainVisible })}
      onClick={actions.toggleRoom}
      aria-expanded={view.listening.roomOpen}
      data-player-room-toggle
      {...labelled(t("listening.count", { count: live.length }))}
    >
      {shown.map((member, index) => (
        <span key={member.userId} className={listeningAvatar()}>
          <Avatar size="sm" imageUrl={member.avatarUrl} username={member.name} />
          {hidden > 0 && index === shown.length - 1 ? <span className={listeningMore()}>+{hidden}</span> : null}
        </span>
      ))}
    </button>
  );
}
