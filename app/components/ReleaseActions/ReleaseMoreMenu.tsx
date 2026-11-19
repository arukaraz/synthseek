"use client";

import { Disc3, EllipsisVertical, User, UserMinus } from "lucide-react";
import { useTranslation } from "react-i18next";

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

import { useReleaseActions } from "./hooks/useReleaseActions";
import { moreItemDanger, moreTrigger } from "./styles";
import type { ReleaseMoreMenuProps } from "./types";

export function ReleaseMoreMenu({ artist, album, label, triggerClassName }: ReleaseMoreMenuProps) {
  const { t } = useTranslation("follows");
  const actions = useReleaseActions();
  const setAutoRequest = useSetAutoRequest();
  const { unfollow } = useUnfollowArtists();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={triggerClassName ?? moreTrigger()} aria-label={label}>
        <EllipsisVertical className="size-4" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
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
