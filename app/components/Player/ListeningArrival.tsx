"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import { LISTENING_ARRIVAL_MS } from "@hooks/ui/player/constants";

import { ListeningNotice } from "./ListeningNotice";
import { listeningNoticeId } from "./helpers";
import type { PlayerProps } from "./types";

export function ListeningArrival({ view, actions }: PlayerProps) {
  const member = view.listening.arrival;
  const { dismissArrival, toggleRoom } = actions;

  useEffect(() => {
    if (member === null) return;
    const id = listeningNoticeId(member);
    toast.custom(
      () => (
        <ListeningNotice
          member={member}
          onOpen={() => {
            toast.dismiss(id);
            dismissArrival();
            toggleRoom();
          }}
        />
      ),
      { id, duration: LISTENING_ARRIVAL_MS }
    );
  }, [member, dismissArrival, toggleRoom]);

  return null;
}
