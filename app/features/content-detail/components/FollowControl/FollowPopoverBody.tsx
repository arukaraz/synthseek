"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { Switch } from "@components/ui/Switch";
import { useSetAutoRequest } from "@hooks/api/mutations/artist-follow/useSetAutoRequest";
import { useUnfollowArtists } from "@hooks/api/mutations/artist-follow/useUnfollowArtists";
import { useFollowNotice } from "@hooks/api/queries/artist-follow/useFollowNotice";
import { useFollowPreferences } from "@hooks/api/queries/artist-follow/useFollowPreferences";
import { followTypesPhrase } from "@utils/follow-format";

import { useContentDetailClose } from "../../ContentDetailCloseContext";

import {
  followFooter,
  followFooterEnd,
  followHint,
  followLink,
  followNotice,
  followPopover,
  followPopoverTitle,
  followQuietDanger,
  followSwitchCopy,
  followSwitchLabel,
  followSwitchRow,
} from "./styles";
import type { FollowPopoverBodyProps } from "./types";

export function FollowPopoverBody({
  catalogArtistId,
  artistName,
  autoRequest,
  onClose,
  showTitle = true,
  fullWidthDone = false,
}: FollowPopoverBodyProps) {
  const { t } = useTranslation("follows");
  const preferences = useFollowPreferences();
  const notice = useFollowNotice();
  const setAutoRequest = useSetAutoRequest();
  const { unfollow } = useUnfollowArtists();
  const closeDetail = useContentDetailClose();
  const hint = preferences.data
    ? t("popover.requestNewHint", { types: followTypesPhrase(preferences.data.types) })
    : "";

  const handleUnfollow = async () => {
    onClose();
    await unfollow([{ catalogArtistId, name: artistName }]);
  };

  const handleSeeCalendar = () => {
    onClose();
    closeDetail();
  };

  return (
    <div className={followPopover()}>
      {showTitle ? <h3 className={followPopoverTitle()}>{t("popover.title", { artist: artistName })}</h3> : null}
      <div className={followSwitchRow()}>
        <div className={followSwitchCopy()}>
          <span className={followSwitchLabel()}>{t("popover.requestNew")}</span>
          <span className={followHint()}>{hint}</span>
        </div>
        <Switch
          checked={autoRequest}
          aria-label={t("popover.switchFor", { artist: artistName })}
          onCheckedChange={(next) => setAutoRequest.mutate({ catalogArtistIds: [catalogArtistId], autoRequest: next })}
        />
      </div>
      {notice === null ? null : (
        <p className={followNotice()}>{notice === "approval" ? t("popover.approval") : t("popover.quota")}</p>
      )}
      <div className={followFooter({ stacked: fullWidthDone })}>
        <button type="button" className={followQuietDanger()} onClick={() => void handleUnfollow()}>
          {t("popover.unfollow")}
        </button>
        <div className={followFooterEnd({ stacked: fullWidthDone })}>
          <Link href="/settings/releases/calendar" className={followLink()} onClick={handleSeeCalendar}>
            {t("popover.seeCalendar")}
          </Link>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t("popover.done")}
          </Button>
        </div>
      </div>
    </div>
  );
}
