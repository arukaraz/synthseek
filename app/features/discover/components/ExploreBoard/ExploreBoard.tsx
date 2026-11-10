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
import { WidgetsDialog } from "../WidgetsDialog/WidgetsDialog";
import { BoardEmpty } from "./BoardEmpty";
import { BoardTile } from "./BoardTile";
import { BoardToolbar } from "./BoardToolbar";
import { BOARD_LIST_OF } from "./constants";
import { boardListsOf, customStatusOf, customWidgetsById, packBoard, placementsById } from "./helpers";
import { boardRoot, liveRegion } from "./styles";

export function ExploreBoard() {
  const { t } = useTranslation("discover");
  const device = useBoardDevice();
  const list = BOARD_LIST_OF[device];
  const { data, isLoading } = useBoardLayout();
  const appearance = useBoardAppearance();
  const myWidgets = useMyWidgets();
  const custom = useMemo(() => customWidgetsById(myWidgets.data), [myWidgets.data]);
  const lists = useMemo(() => boardListsOf(data, custom), [data, custom]);
  const items = lists[list];
  const customStatus = customStatusOf(myWidgets);
  const editor = useBoardEditor(lists, list, custom, customStatus);
  const placements = useMemo(
    () => placementsById(packBoard(editor.displayItems, device, custom)),
    [editor.displayItems, device, custom]
  );

  if (isLoading) return <SectionLoading />;

  return (
    <section
      ref={editor.rootRef}
      className={boardRoot({ editing: editor.editing })}
      aria-label={t("board.regionLabel")}
    >
      {items.length === 0 ? (
        <BoardEmpty onAddWidget={editor.openWidgets} />
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
        onAddSpacer={editor.addSpacer}
        onWidgets={editor.openWidgets}
      />
      <p className={liveRegion()} aria-live="polite">
        {editor.announcement}
      </p>
      {editor.widgets ? (
        <WidgetsDialog
          lists={lists}
          opening={editor.widgets}
          custom={custom}
          onSave={editor.saveBoard}
          onClose={editor.closeWidgets}
        />
      ) : null}
    </section>
  );
}
