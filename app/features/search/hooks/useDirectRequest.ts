"use client";

import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { ContentType, type MusicTrack } from "@api/__generated__/types";
import { useContentsFetcher } from "@hooks/api";
import { titleCase } from "@utils/formatters";

import { getItemDisplayName, tracksFromContents } from "../components/ConfigRequestModal/helpers";
import { needsConfirmation } from "./helpers";
import type { DirectRequestTarget, PendingConfirmation } from "./types";
import { useContentRequestSubmit } from "./useContentRequestSubmit";

export function useDirectRequest() {
  const { t } = useTranslation("search");
  const fetchContents = useContentsFetcher();
  const { submit } = useContentRequestSubmit();
  const [pending, setPending] = useState<PendingConfirmation | null>(null);
  const inFlight = useRef(new Set<string>());

  const reportNoTracks = (target: DirectRequestTarget) =>
    toast.error(t("config.errors.fetchFailed", { type: titleCase(target.item.type) }));

  const send = (target: DirectRequestTarget, tracks: MusicTrack[]) => {
    const outcome = submit({ item: target.item, mode: target.mode, parentAlbum: target.parentAlbum, tracks });
    if (outcome === "noTracks") reportNoTracks(target);
  };

  const resolveTracks = async (target: DirectRequestTarget): Promise<MusicTrack[]> => {
    if (target.tracks) return target.tracks;
    return tracksFromContents(await fetchContents(target.item.id, target.item.type));
  };

  const request = async (target: DirectRequestTarget) => {
    if (target.item.type === ContentType.enum.track) {
      send(target, []);
      return;
    }
    const key = `${target.mode}:${target.item.type}:${target.item.id}`;
    if (inFlight.current.has(key)) return;
    inFlight.current.add(key);
    try {
      const tracks = await resolveTracks(target);
      if (tracks.length === 0) {
        reportNoTracks(target);
        return;
      }
      if (needsConfirmation(target)) setPending({ target, tracks, name: getItemDisplayName(target.item) });
      else send(target, tracks);
    } catch {
      reportNoTracks(target);
    } finally {
      inFlight.current.delete(key);
    }
  };

  const confirm = () => {
    if (pending) send(pending.target, pending.tracks);
    setPending(null);
  };

  const cancel = () => setPending(null);

  return { request, pending, confirm, cancel };
}
