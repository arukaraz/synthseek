"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { BoardGrid } from "@components/BoardGrid";
import { SectionLoading } from "@components/ui/SectionLoading";
import { useBoardAppearance } from "@hooks/api/queries/board/useBoardAppearance";
import { useBoardLayout } from "@hooks/api/queries/board/useBoardLayout";
import { useMyWidgets } from "@hooks/api/queries/widgets/useMyWidgets";
import { useBoardDevice } from "@hooks/ui/board/useBoardDevice";

import { useBoardEditor } from "../../hooks/useBoardEditor";
import { WidgetGallery } from "../WidgetGallery/WidgetGallery";
import { BoardEmpty } from "./BoardEmpty";
import { BoardTile } from "./BoardTile";
import { BoardToolbar } from "./BoardToolbar";
import { boardItemsOf, customStatusOf, customWidgetsById, packBoard, placementsById } from "./helpers";
import { boardRoot, liveRegion } from "./styles";

export function ExploreBoard() {
  const { t } = useTranslation("discover");
  const device = useBoardDevice();
  const { data, isLoading } = useBoardLayout();
  const appearance = useBoardAppearance();
  const myWidgets = useMyWidgets();
  const items = useMemo(() => boardItemsOf(data), [data]);
  const custom = useMemo(() => customWidgetsById(myWidgets.data), [myWidgets.data]);
  const customStatus = customStatusOf(myWidgets);
  const editor = useBoardEditor(items, custom, customStatus);
  const placements = useMemo(
    () => placementsById(packBoard(editor.displayItems, device, custom)),
    [editor.displayItems, device, custom]
  );

  if (isLoading) return <SectionLoading />;

  return (
    <section ref={editor.rootRef} className={boardRoot()} aria-label={t("board.regionLabel")}>
      {items.length === 0 ? (
        <BoardEmpty onAddWidget={editor.openGallery} />
      ) : (
        <BoardGrid device={device} appearance={appearance.data}>
          {items.map((item, index) => {
            const tile = placements.get(item.id);
            if (!tile) return null;
            return (
              <BoardTile
                key={item.id}
                tile={tile}
                device={device}
                custom={custom}
                customStatus={customStatus}
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
      {items.length > 0 ? (
        <BoardToolbar
          editing={editor.editing}
          onCustomize={editor.startEditing}
          onDone={editor.stopEditing}
          onAddWidget={editor.openGallery}
        />
      ) : null}
      <p className={liveRegion()} aria-live="polite">
        {editor.announcement}
      </p>
      {editor.galleryOpen ? (
        <WidgetGallery
          items={items}
          customize={editor.customizeTarget}
          onAdd={editor.add}
          onAddCustom={editor.addCustom}
          onRemove={editor.actions.remove}
          onTemplateApplied={editor.templateApplied}
          onClose={() => editor.setGalleryOpen(false)}
        />
      ) : null}
    </section>
  );
}
