"use client";

import { useTranslation } from "react-i18next";

import { ReleaseMoreMenu } from "@components/ReleaseActions";
import { isRequestable, ReleaseState } from "@components/ReleaseState";

import { followMoreTrigger } from "./styles";
import type { FollowItemMoreProps } from "./types";

export function FollowItemMore({ item }: FollowItemMoreProps) {
  const { t } = useTranslation("follows");
  const { follow } = item;
  if (follow === undefined) return null;
  const album =
    item.open === null
      ? undefined
      : { catalogAlbumId: item.open.id, title: item.title, artistName: follow.artistName, cover: item.cover };

  return (
    <>
      {isRequestable(follow.state) ? null : (
        <ReleaseState state={follow.state} autoRequest={follow.autoRequest} showLabel={false} />
      )}
      <ReleaseMoreMenu
        artist={{
          catalogArtistId: follow.catalogArtistId,
          name: follow.artistName,
          cover: null,
          autoRequest: follow.autoRequest,
        }}
        album={album}
        state={album ? follow.state : undefined}
        label={t("action.moreFor", { name: item.title })}
        triggerClassName={followMoreTrigger()}
      />
    </>
  );
}
