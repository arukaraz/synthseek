"use client";

import { Disc3, Download, EllipsisVertical, User, UserMinus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { releaseStateInfo } from "@components/ReleaseState";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/DropdownMenu";
import { useSetAutoRequest } from "@hooks/api/mutations/artist-follow/useSetAutoRequest";
import { useUnfollowArtists } from "@hooks/api/mutations/artist-follow/useUnfollowArtists";
import { useMyQuota } from "@hooks/api/queries/useMyQuota";

import { isQuotaFull } from "./helpers";
import { useReleaseActions } from "./hooks/useReleaseActions";
import { moreItemDanger, moreItemHint, moreTrigger } from "./styles";
import type { ReleaseMoreMenuProps } from "./types";

export function ReleaseMoreMenu({ artist, album, state, label, triggerClassName }: ReleaseMoreMenuProps) {
  const { t } = useTranslation("follows");
  const actions = useReleaseActions();
  const setAutoRequest = useSetAutoRequest();
  const { unfollow } = useUnfollowArtists();
  const quota = useMyQuota();
  const requestable = album !== undefined && state !== undefined && releaseStateInfo(state, false).action === "request";
  const locked = state === "quota_skipped" && isQuotaFull(quota.data);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={triggerClassName ?? moreTrigger()} aria-label={label}>
        <EllipsisVertical className="size-4" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {requestable ? (
          <DropdownMenuItem disabled={locked} onSelect={() => actions.request(album, "direct")}>
            <Download aria-hidden />
            <span>
              {t("action.request")}
              {locked ? <span className={moreItemHint()}>{t("action.quotaReached")}</span> : null}
            </span>
          </DropdownMenuItem>
        ) : null}
        {album ? (
          <DropdownMenuItem onSelect={() => actions.openAlbum(album)}>
            <Disc3 aria-hidden />
            {t("action.openAlbum")}
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem onSelect={() => actions.openArtist(artist)}>
          <User aria-hidden />
          {t("action.openArtist")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={artist.autoRequest}
          onCheckedChange={(next) =>
            setAutoRequest.mutate({ catalogArtistIds: [artist.catalogArtistId], autoRequest: next === true })
          }
        >
          {t("action.autoRequest")}
        </DropdownMenuCheckboxItem>
        <DropdownMenuItem
          className={moreItemDanger()}
          onSelect={() => void unfollow([{ catalogArtistId: artist.catalogArtistId, name: artist.name }])}
        >
          <UserMinus aria-hidden />
          {t("action.unfollow", { artist: artist.name })}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
