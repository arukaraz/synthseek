"use client";

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, GripVertical, Pencil, SlidersHorizontal, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useWidgetPresets } from "@hooks/api/queries/widgets/useWidgetPresets";

import { presetFor } from "../WidgetGallery/helpers";
import { BoardTileSizes } from "./BoardTileSizes";
import { controlButton, dragHandle, tileBar, tileBarName, tileBarTools } from "./styles";
import type { BoardTileEditControlsProps } from "./types";

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
  const customizable = item.kind === "builtin" && presetFor(presets.data, item.widget) ? item.widget : null;
  const editableWidget = item.kind === "custom" && editable ? item.widgetId : null;
  const EarlierIcon = device === "wide" ? ArrowLeft : ArrowUp;
  const LaterIcon = device === "wide" ? ArrowRight : ArrowDown;

  return (
    <div className={tileBar()}>
      <button
        type="button"
        tabIndex={-1}
        className={dragHandle()}
        aria-label={t("board.tile.drag", { name })}
        onPointerDown={(event) => actions.startDrag(event, item.id)}
      >
        <GripVertical className="size-4" />
      </button>
      <span className={tileBarName()}>{name}</span>
      <div className={tileBarTools()}>
        <BoardTileSizes item={item} device={device} name={name} onResize={actions.resize} />
        <button
          type="button"
          className={controlButton()}
          aria-label={t("board.tile.moveEarlier", { name })}
          disabled={position <= 1}
          onClick={() => actions.move(item.id, -1)}
        >
          <EarlierIcon className="size-4" />
        </button>
        <button
          type="button"
          className={controlButton()}
          aria-label={t("board.tile.moveLater", { name })}
          disabled={position >= total}
          onClick={() => actions.move(item.id, 1)}
        >
          <LaterIcon className="size-4" />
        </button>
        {customizable ? (
          <button
            type="button"
            className={controlButton()}
            aria-label={t("widgets:customize.actionNamed", { name })}
            title={t("widgets:customize.action")}
            onClick={() => actions.customize(customizable)}
          >
            <SlidersHorizontal className="size-4" />
          </button>
        ) : null}
        {editableWidget ? (
          <button
            type="button"
            className={controlButton()}
            aria-label={t("widgets:mine.editNamed", { name })}
            title={t("widgets:mine.edit")}
            onClick={() => actions.edit(editableWidget)}
          >
            <Pencil className="size-4" />
          </button>
        ) : null}
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
