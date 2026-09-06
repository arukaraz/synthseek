"use client";

import { ChevronDown, ChevronUp, Library } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { MINI_COLLAPSED_HEIGHT_PX, MINI_EXTRAS_HEIGHT_PX, MINI_PLACEHOLDER_ROWS, MINI_QUEUE_ROUTE } from "./constants";
import { FavouriteButton } from "./FavouriteButton";
import { PlayerExtraControls } from "./PlayerExtraControls";
import { PlayerTransport } from "./PlayerTransport";
import { PlayerWave } from "./PlayerWave";
import { TrackCover } from "./TrackCover";
import { formatClock, labelled, trackInitials } from "./helpers";
import { ensureMiniHeight } from "./miniWindow";
import {
  clock,
  miniArtist,
  miniChevronRow,
  miniExtras,
  miniFooter,
  miniHeader,
  miniLibraryButton,
  miniList,
  miniListCaption,
  miniProgress,
  miniRoot,
  miniRow,
  miniRowSub,
  miniRowText,
  miniRowThumb,
  miniRowTitle,
  miniTextColumn,
  miniTitle,
  miniTransport,
  iconButton,
} from "./styles";
import type { PlayerProps } from "./types";

export function MiniPlayer({ view, actions }: PlayerProps) {
  const { t } = useTranslation("player");
  const router = useRouter();
  const [controlsOpen, setControlsOpen] = useState(false);

  const toggleControls = () => {
    const next = !controlsOpen;
    setControlsOpen(next);
    ensureMiniHeight(MINI_COLLAPSED_HEIGHT_PX + (next ? MINI_EXTRAS_HEIGHT_PX : 0));
  };

  return (
    <div className={miniRoot()}>
      <div className={miniHeader()}>
        <TrackCover
          initials={trackInitials(view.track.album)}
          tone={view.track.tone}
          size="row"
          artworkUrl={view.track.artworkUrl}
        />
        <span className={miniTextColumn()}>
          <span className={miniTitle()}>{view.track.title}</span>
          <span className={miniArtist()}>{view.track.artist}</span>
        </span>
        <FavouriteButton view={view} actions={actions} />
      </div>

      <div className={miniTransport()}>
        <PlayerTransport view={view} actions={actions} size="mini" />
      </div>

      <div className={miniProgress()}>
        <span className={clock({ align: "right" })}>{formatClock(view.positionSeconds)}</span>
        <PlayerWave view={view} actions={actions} size="bar" />
        <span className={clock()}>{formatClock(view.track.durationSeconds)}</span>
      </div>

      <div className={miniChevronRow()}>
        <button
          type="button"
          className={iconButton({ size: "inline" })}
          onClick={toggleControls}
          aria-expanded={controlsOpen}
          {...labelled(t(controlsOpen ? "mini.hideControls" : "mini.showControls"))}
        >
          {controlsOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
      </div>

      {controlsOpen ? (
        <div className={miniExtras()}>
          <PlayerExtraControls view={view} actions={actions} omitTransport />
        </div>
      ) : null}

      <span className={miniListCaption()}>{t("mini.upNext")}</span>
      <div className={miniList()}>
        {Array.from({ length: MINI_PLACEHOLDER_ROWS }, (_, index) => (
          <div key={index} className={miniRow()} aria-hidden>
            <span className={miniRowThumb()} />
            <span className={miniRowText()}>
              <span className={miniRowTitle()} />
              <span className={miniRowSub()} />
            </span>
          </div>
        ))}
      </div>

      <div className={miniFooter()}>
        <button
          type="button"
          className={miniLibraryButton()}
          onClick={() => {
            router.push(MINI_QUEUE_ROUTE);
            window.focus();
          }}
        >
          <Library className="size-4" />
          {t("mini.openLibrary")}
        </button>
      </div>
    </div>
  );
}
