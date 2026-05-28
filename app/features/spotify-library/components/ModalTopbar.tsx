"use client";

import { brandChip, brandIcon, topbar } from "../styles";
import { SpotifyMark } from "./SpotifyMark";

export function ModalTopbar() {
  return (
    <div className={topbar()}>
      <span className={brandChip()}>
        <span className={brandIcon()}>
          <SpotifyMark />
        </span>
        Spotify
      </span>
    </div>
  );
}
