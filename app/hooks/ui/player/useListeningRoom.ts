"use client";

import type { PlayerListeningMember } from "@components/Player";
import { useListeningNow } from "@hooks/api";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { LISTENING_ARRIVAL_MS } from "./constants";
import { arrivedMember, listeningMembersFrom } from "./listening";
import type { ListeningRoom } from "./types";

export function useListeningRoom(): ListeningRoom {
  const { data } = useListeningNow();
  const { live, earlier } = useMemo(() => listeningMembersFrom(data ?? []), [data]);
  const known = useRef<ReadonlySet<string> | null>(null);
  const [arrival, setArrival] = useState<PlayerListeningMember | null>(null);

  useEffect(() => {
    if (data === undefined) return;
    const arrived = arrivedMember(known.current, live);
    known.current = new Set(live.map((member) => member.userId));
    if (arrived !== null) setArrival(arrived);
  }, [data, live]);

  useEffect(() => {
    if (arrival === null) return;
    const timer = window.setTimeout(() => setArrival(null), LISTENING_ARRIVAL_MS);
    return () => window.clearTimeout(timer);
  }, [arrival]);

  const dismissArrival = useCallback(() => setArrival(null), []);

  return { live, earlier, arrival, dismissArrival };
}
