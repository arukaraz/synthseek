"use client";

import { ChevronDown, ChevronUp, Library } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { MINI_COLLAPSED_HEIGHT_PX, MINI_EXTRAS_HEIGHT_PX, MINI_QUEUE_ROUTE } from "./constants";
import { FavouriteButton } from "./FavouriteButton";
import { PlayerExtraControls } from "./PlayerExtraControls";
import { PlayerTransport } from "./PlayerTransport";
import { PlayerWave } from "./PlayerWave";
import { QueueBody } from "./QueueBody";
import { TrackCover } from "./TrackCover";
import { UpgradeButton } from "./UpgradeButton";
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
  miniProgress,
  miniRoot,
  miniTextColumn,
  miniTitle,
  miniTransport,
  iconButton,
} from "./styles";
import type { MiniPlayerProps } from "./types";

export function MiniPlayer({ view, actions, placement = "window" }: MiniPlayerProps) {
  const { t } = useTranslation("player");
  const router = useRouter();
  const [controlsOpen, setControlsOpen] = useState(false);
  const inWindow = placement === "window";

  const toggleControls = () => {
    const next = !controlsOpen;
    setControlsOpen(next);
    if (inWindow) ensureMiniHeight(MINI_COLLAPSED_HEIGHT_PX + (next ? MINI_EXTRAS_HEIGHT_PX : 0));
  };

  return (
    <div className={miniRoot({ placement })}>
      <div className={miniHeader({ placement })}>
        <TrackCover
          initials={trackInitials(view.track.album)}
          tone={view.track.tone}
          size={inWindow ? "row" : "sideways"}
          artworkUrl={view.track.artworkUrl}
        />
        <span className={miniTextColumn({ placement })}>
          <span className={miniTitle({ placement })}>{view.track.title}</span>
          <span className={miniArtist({ placement })}>{view.track.artist}</span>
        </span>
        <FavouriteButton view={view} actions={actions} size={inWindow ? undefined : "stage"} />
        <UpgradeButton view={view} actions={actions} size={inWindow ? undefined : "stage"} />
      </div>

      <div className={miniTransport({ placement })}>
        <PlayerTransport view={view} actions={actions} size={inWindow ? "mini" : "sideways"} />
      </div>

      <div className={miniProgress({ placement })}>
        <span className={clock({ size: inWindow ? "bar" : "stage", align: "right" })}>
          {formatClock(view.positionSeconds)}
        </span>
        <PlayerWave view={view} actions={actions} size={inWindow ? "bar" : "stage"} />
        <span className={clock({ size: inWindow ? "bar" : "stage" })}>{formatClock(view.track.durationSeconds)}</span>
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
          <PlayerExtraControls view={view} actions={actions} omitTransport onStage={!inWindow} />
        </div>
      ) : null}

      {inWindow ? (
        <>
          <QueueBody view={view} actions={actions} />
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
        </>
      ) : null}
    </div>
  );
}
