import type { PlayerListeningMember } from "@components/Player";

import type { ListeningNowRow } from "./types";

function byLatestPlay(a: PlayerListeningMember, b: PlayerListeningMember): number {
  return b.playedAt.getTime() - a.playedAt.getTime();
}

export function listeningMembersFrom(rows: readonly ListeningNowRow[]): {
  live: PlayerListeningMember[];
  earlier: PlayerListeningMember[];
} {
  const members = rows
    .map(({ username, ...row }) => ({ ...row, name: username, playedAt: new Date(row.playedAt) }))
    .sort(byLatestPlay);
  return {
    live: members.filter((member) => member.playing),
    earlier: members.filter((member) => !member.playing),
  };
}

export function arrivedMember(
  known: ReadonlySet<string> | null,
  live: readonly PlayerListeningMember[]
): PlayerListeningMember | null {
  if (known === null) return null;
  return live.find((member) => !known.has(member.userId)) ?? null;
}
