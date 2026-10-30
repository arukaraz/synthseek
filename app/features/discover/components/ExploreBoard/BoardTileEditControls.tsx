"use client";

import { Move, Pencil, SlidersHorizontal, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useWidgetPresets } from "@hooks/api/queries/widgets/useWidgetPresets";

import { presetFor } from "../WidgetGallery/helpers";
import { BoardTileSizes } from "./BoardTileSizes";
import { controlButton, dragHandle, tileBar, tileBarName, tileBarTools } from "./styles";
import { TileSettingsMenu } from "./TileSettingsMenu";
import type { BoardTileEditControlsProps, TileMenuOpener } from "./types";

export function BoardTileEditControls({
  item,
  device,
  name,
  editable,
  position,
  total,
  actions,
}: BoardTileEditControlsProps) {
  const { t } = useTranslation(["discover", "widgets"]);
  const presets = useWidgetPresets();

  const openerOf = (): TileMenuOpener | undefined => {
    if (item.kind === "builtin" && presetFor(presets.data, item.widget)) {
      return {
        icon: SlidersHorizontal,
        label: t("widgets:customize.action"),
        onSelect: () => actions.customize(item.widget),
      };
    }
    if (item.kind === "custom" && editable) {
      return { icon: Pencil, label: t("widgets:mine.edit"), onSelect: () => actions.edit(item.widgetId) };
    }
    return undefined;
  };

  return (
    <div className={tileBar()}>
      <button
        type="button"
        tabIndex={-1}
        className={dragHandle()}
        aria-label={t("board.tile.drag", { name })}
        onPointerDown={(event) => actions.startDrag(event, item.id)}
      >
        <Move className="size-4" />
      </button>
      <span className={tileBarName()}>{name}</span>
      <div className={tileBarTools()}>
        <BoardTileSizes item={item} device={device} name={name} onResize={actions.resize} />
        <TileSettingsMenu
          item={item}
          device={device}
          name={name}
          position={position}
          total={total}
          actions={actions}
          opener={openerOf()}
        />
        <button
          type="button"
          className={controlButton({ tone: "danger" })}
          aria-label={t("board.tile.remove", { name })}
          onClick={() => actions.remove(item.id)}
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
