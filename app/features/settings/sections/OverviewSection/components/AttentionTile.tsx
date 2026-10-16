"use client";

import { useSettingsNavigate } from "../../../components/SettingsSaveScope";
import { tile, tileCaption, tileCount, tileTitle } from "../styles";
import type { AttentionTileProps } from "../types";

export function AttentionTile({ title, count, caption, href }: AttentionTileProps) {
  const navigate = useSettingsNavigate();

  return (
    <button type="button" className={tile()} onClick={() => navigate(href)}>
      <span className={tileTitle()}>{title}</span>
      <span className={tileCount()}>{count.toLocaleString()}</span>
      <span className={tileCaption()}>{caption}</span>
    </button>
  );
}
