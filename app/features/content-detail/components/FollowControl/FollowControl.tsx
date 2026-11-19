"use client";

import { Check, ChevronDown, UserPlus, Zap } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { BottomSheet, BottomSheetHeader, bottomSheetBody } from "@components/ui/BottomSheet";
import { LockedAction } from "@components/ui/LockedAction";
import { Popover, PopoverAnchor, PopoverContent } from "@components/ui/Popover";
import { useFollowArtist } from "@hooks/api/mutations/artist-follow/useFollowArtist";
import { useFollowStatus } from "@hooks/api/queries/artist-follow/useFollowStatus";
import { PHONE_QUERY } from "@hooks/ui/constants";
import { useMediaQuery } from "@hooks/ui/useMediaQuery";

import { FollowLabel } from "./FollowLabel";
import { FollowPopoverBody } from "./FollowPopoverBody";
import { followMore, followPill, followSheetBody } from "./styles";
import type { FollowControlProps } from "./types";

export function FollowControl({ catalogArtistId, artistName }: FollowControlProps) {
  const { t } = useTranslation("follows");
  const status = useFollowStatus(catalogArtistId);
  const follow = useFollowArtist(artistName);
  const phone = useMediaQuery(PHONE_QUERY);
  const [open, setOpen] = useState(false);

  if (!status.data) {
    return (
      <button type="button" className={followPill({ tone: "loading" })} disabled aria-busy={status.isLoading}>
        <UserPlus className="size-4" aria-hidden />
        <FollowLabel live="follow" />
      </button>
    );
  }

  const { followable, following, autoRequest } = status.data;

  if (!followable) {
    const reason = t("control.notFollowable");
    return (
      <LockedAction label={t("control.followNamed", { artist: artistName })} hint={reason}>
        <span className={followPill({ tone: "locked" })} onClick={() => toast.info(reason)}>
          <UserPlus className="size-4" aria-hidden />
          <FollowLabel live="follow" />
        </span>
      </LockedAction>
    );
  }

  const close = () => setOpen(false);

  const handlePress = () => {
    if (!following) follow.mutate({ catalogArtistId, autoRequest: false }, { onError: close });
    setOpen(true);
  };

  const trigger = (
    <button
      type="button"
      className={followPill({ tone: following ? "following" : "idle" })}
      aria-label={
        following
          ? t("control.followingNamed", { artist: artistName })
          : t("control.followNamed", { artist: artistName })
      }
      aria-haspopup="dialog"
      aria-expanded={following ? open : undefined}
      onClick={handlePress}
    >
      {following ? <Check className="size-4" aria-hidden /> : <UserPlus className="size-4" aria-hidden />}
      <FollowLabel live={following ? "following" : "follow"} />
      {following && autoRequest ? <Zap className="size-3.5" aria-label={t("control.automatic")} /> : null}
      {following ? (
        <span className={followMore()} aria-hidden>
          <ChevronDown className="size-4" />
        </span>
      ) : null}
    </button>
  );

  if (phone) {
    return (
      <>
        {trigger}
        <BottomSheet open={open} onOpenChange={setOpen} size="compact" showClose={false}>
          <BottomSheetHeader title={t("popover.title", { artist: artistName })} />
          <div className={bottomSheetBody()}>
            <div className={followSheetBody()}>
              <FollowPopoverBody
                catalogArtistId={catalogArtistId}
                artistName={artistName}
                autoRequest={autoRequest}
                onClose={close}
                showTitle={false}
                fullWidthDone
              />
            </div>
          </div>
        </BottomSheet>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>{trigger}</PopoverAnchor>
      <PopoverContent align="start" className="max-w-none p-3">
        <FollowPopoverBody
          catalogArtistId={catalogArtistId}
          artistName={artistName}
          autoRequest={autoRequest}
          onClose={close}
        />
      </PopoverContent>
    </Popover>
  );
}
