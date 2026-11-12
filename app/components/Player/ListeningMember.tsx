"use client";

import { Avatar } from "@components/ui/Avatar";
import { formatRelativeTime } from "@utils/formatters";

import { TrackCover } from "./TrackCover";
import { trackInitials } from "./helpers";
import { roomAgo, roomCard, roomDetail, roomLiveDot, roomName, roomRow, roomText, roomTrack } from "./styles";
import type { ListeningMemberProps } from "./types";

export function ListeningMember({ member }: ListeningMemberProps) {
  if (!member.playing) {
    return (
      <div className={roomRow()}>
        <Avatar size="sm" imageUrl={member.avatarUrl} username={member.name} />
        <span className={roomText()}>
          <span className={roomName()}>
            <span className="truncate">{member.name}</span>
          </span>
          <span className={roomDetail()}>
            {member.title} · {member.artist}
          </span>
        </span>
        <span className={roomAgo()}>{formatRelativeTime(member.playedAt)}</span>
      </div>
    );
  }

  return (
    <div className={roomCard()}>
      <TrackCover initials={trackInitials(member.album)} tone="accent" size="card" artworkUrl={member.artworkUrl} />
      <span className={roomText()}>
        <span className={roomName()}>
          <span className={roomLiveDot()} />
          <span className="truncate">{member.name}</span>
          {member.client === null ? null : <span className={roomAgo()}>{member.client}</span>}
        </span>
        <span className={roomTrack()}>{member.title}</span>
        <span className={roomDetail()}>
          {member.artist} · {member.album}
        </span>
      </span>
      <Avatar size="sm" imageUrl={member.avatarUrl} username={member.name} />
    </div>
  );
}
