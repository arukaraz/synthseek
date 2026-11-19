"use client";

import { useTranslation } from "react-i18next";

import { ImageWithFallback } from "@components/ImageWithFallback";
import { ReleaseMoreMenu, useReleaseActions } from "@components/ReleaseActions";
import { Checkbox } from "@components/ui/Checkbox";
import { DataTable, type ColumnDef } from "@components/ui/Table";
import { Switch } from "@components/ui/Switch";
import { useSetAutoRequest } from "@hooks/api/mutations/artist-follow/useSetAutoRequest";
import type { FollowedArtist } from "@hooks/api/queries/artist-follow/types";

import { latestLine } from "../helpers";
import { artistAvatar, artistButton, artistName, hintText, latestCell, switchCell } from "../styles";
import type { FollowingTableProps } from "./types";

export function FollowingTable({ items, selection }: FollowingTableProps) {
  const { t } = useTranslation("follows");
  const setAutoRequest = useSetAutoRequest();
  const actions = useReleaseActions();
  const orderedIds = items.map((item) => item.catalogArtistId);

  const columns: ColumnDef<FollowedArtist>[] = [
    {
      key: "select",
      className: "hidden w-10 sm:table-cell",
      header: () => (
        <Checkbox
          checked={
            selection.selectors.allSelectedOnPage(items.map((item) => ({ id: item.catalogArtistId })))
              ? true
              : selection.selectors.someSelectedOnPage(items.map((item) => ({ id: item.catalogArtistId })))
                ? "indeterminate"
                : false
          }
          onCheckedChange={(next) => selection.setMany(orderedIds, next === true)}
          aria-label={t("following.selectAll")}
        />
      ),
      cell: (item) => (
        <Checkbox
          checked={selection.isSelected(item.catalogArtistId)}
          aria-label={t("following.selectRow", { artist: item.name })}
          onClick={(event) => {
            if (!event.shiftKey) return;
            event.preventDefault();
            selection.extendTo(orderedIds, item.catalogArtistId);
          }}
          onCheckedChange={() => selection.toggle(item.catalogArtistId)}
        />
      ),
    },
    {
      key: "artist",
      header: t("following.columnArtist"),
      cell: (item) => (
        <button
          type="button"
          className={artistButton()}
          onClick={() =>
            actions.openArtist({
              catalogArtistId: item.catalogArtistId,
              name: item.name,
              cover: item.image,
              autoRequest: item.autoRequest,
            })
          }
        >
          <span className={artistAvatar()}>
            <ImageWithFallback src={item.image} alt="" fill sizes="36px" />
          </span>
          <span className={artistName()}>{item.name}</span>
        </button>
      ),
    },
    {
      key: "latest",
      header: t("following.columnLatest"),
      className: "hidden sm:table-cell",
      cell: (item) => (
        <span className={latestCell()}>
          <span className={artistName()}>{item.latest?.title ?? ""}</span>
          <span className={hintText()}>{latestLine(item)}</span>
        </span>
      ),
    },
    {
      key: "auto",
      className: "w-24 sm:w-40",
      header: t("following.columnAuto"),
      cell: (item) => (
        <span className={switchCell()} title={item.unresolvable ? t("following.unresolvableHint") : undefined}>
          <Switch
            checked={item.autoRequest}
            disabled={item.unresolvable}
            aria-label={t("following.switchFor", { artist: item.name })}
            onCheckedChange={(next) =>
              setAutoRequest.mutate({ catalogArtistIds: [item.catalogArtistId], autoRequest: next })
            }
          />
        </span>
      ),
    },
    {
      key: "more",
      header: "",
      className: "w-12",
      cell: (item) => (
        <ReleaseMoreMenu
          artist={{
            catalogArtistId: item.catalogArtistId,
            name: item.name,
            cover: item.image,
            autoRequest: item.autoRequest,
          }}
          label={t("following.moreFor", { name: item.name })}
        />
      ),
    },
  ];

  return <DataTable data={items} columns={columns} getRowId={(item) => item.catalogArtistId} fixedLayout />;
}
