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
import { BoardArrangeDialog } from "../BoardArrange/BoardArrangeDialog";
import { BoardTemplatesDialog } from "../BoardSettings/BoardTemplatesDialog";
import { WidgetGallery } from "../WidgetGallery/WidgetGallery";
import { BoardEmpty } from "./BoardEmpty";
import { BoardTile } from "./BoardTile";
import { BoardToolbar } from "./BoardToolbar";
import {
  boardBackgroundOf,
  boardItemsOf,
  customStatusOf,
  customWidgetsById,
  packBoard,
  placementsById,
  shownItems,
} from "./helpers";
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
    () => placementsById(packBoard(shownItems(editor.displayItems, device, editor.editing), device, custom)),
    [editor.displayItems, editor.editing, device, custom]
  );

  if (isLoading) return <SectionLoading />;

  return (
    <section
      ref={editor.rootRef}
      className={boardRoot({ editing: editor.editing })}
      aria-label={t("board.regionLabel")}
    >
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
      <BoardToolbar
        editing={editor.editing}
        onCustomize={editor.startEditing}
        onDone={editor.stopEditing}
        onManageWidgets={editor.openGallery}
        onAddSpacer={editor.addSpacer}
        onArrange={editor.openArrange}
        onTemplates={editor.openTemplates}
        background={boardBackgroundOf(items)}
        onBackground={editor.setBackgrounds}
      />
      <p className={liveRegion()} aria-live="polite">
        {editor.announcement}
      </p>
      {editor.arrangeWidth !== null ? (
        <BoardArrangeDialog
          items={items}
          device={device}
          boardWidth={editor.arrangeWidth}
          appearance={appearance.data}
          custom={custom}
          customStatus={customStatus}
          onSave={editor.saveArrangement}
          onClose={editor.closeArrange}
        />
      ) : null}
      {editor.galleryOpen ? (
        <WidgetGallery
          items={items}
          target={editor.galleryTarget}
          onAdd={editor.add}
          onAddCustom={editor.addCustom}
          onRemove={editor.actions.remove}
          onClose={() => editor.setGalleryOpen(false)}
        />
      ) : null}
      {editor.templatesOpen ? (
        <BoardTemplatesDialog
          items={items}
          onApplied={(applied) => {
            editor.templateApplied(applied);
            editor.closeTemplates();
          }}
          onClose={editor.closeTemplates}
        />
      ) : null}
    </section>
  );
}
