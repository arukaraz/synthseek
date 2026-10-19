"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { BoardGrid } from "@components/BoardGrid";
import { SectionLoading } from "@components/ui/SectionLoading";
import { useBoardLayout } from "@hooks/api/queries/board/useBoardLayout";
import { useBoardDevice } from "@hooks/ui/board/useBoardDevice";

import { useBoardEditor } from "../../hooks/useBoardEditor";
import { WidgetGallery } from "../WidgetGallery/WidgetGallery";
import { BoardEmpty } from "./BoardEmpty";
import { BoardTile } from "./BoardTile";
import { BoardToolbar } from "./BoardToolbar";
import { boardItemsOf, packBoard, placementsById } from "./helpers";
import { boardRoot, liveRegion } from "./styles";

export function ExploreBoard() {
  const { t } = useTranslation("discover");
  const device = useBoardDevice();
  const { data, isLoading } = useBoardLayout();
  const items = useMemo(() => boardItemsOf(data), [data]);
  const editor = useBoardEditor(items);
  const placements = useMemo(
    () => placementsById(packBoard(editor.displayItems, device)),
    [editor.displayItems, device]
  );

  if (isLoading) return <SectionLoading />;

  return (
    <section className={boardRoot()} aria-label={t("board.regionLabel")}>
      {items.length > 0 ? (
        <BoardToolbar
          editing={editor.editing}
          onCustomize={editor.startEditing}
          onDone={editor.stopEditing}
          onAddWidget={editor.openGallery}
        />
      ) : null}
      {items.length === 0 ? (
        <BoardEmpty onAddWidget={editor.openGallery} />
      ) : (
        <BoardGrid device={device}>
          {items.map((item, index) => {
            const tile = placements.get(item.id);
            if (!tile) return null;
            return (
              <BoardTile
                key={item.id}
                tile={tile}
                device={device}
                editing={editor.editing}
                dragging={editor.draggingId === item.id}
                position={index + 1}
                total={items.length}
                actions={editor.actions}
              />
            );
          })}
        </BoardGrid>
      )}
      <p className={liveRegion()} aria-live="polite">
        {editor.announcement}
      </p>
      {editor.galleryOpen ? (
        <WidgetGallery
          items={items}
          onAdd={editor.add}
          onRemove={editor.actions.remove}
          onClose={() => editor.setGalleryOpen(false)}
        />
      ) : null}
    </section>
  );
}
