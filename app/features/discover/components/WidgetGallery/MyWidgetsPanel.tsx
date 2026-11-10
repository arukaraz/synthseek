"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { useRemoveWidget } from "@hooks/api/mutations/widgets/useRemoveWidget";
import { useSaveWidget } from "@hooks/api/mutations/widgets/useSaveWidget";
import type { WidgetDocument } from "@hooks/api/queries/widgets/types";

import { DeleteWidgetDialog } from "./DeleteWidgetDialog";
import { copyWidgetJson, customTilesOf, duplicateOf, exportJsonOf, layoutPlacementOf } from "./helpers";
import { MyWidgetCard } from "./MyWidgetCard";
import { NewWidgetCard } from "./NewWidgetCard";
import { galleryEmpty, galleryGrid } from "./styles";
import type { MyWidgetsPanelProps } from "./types";

export function MyWidgetsPanel({
  widgets,
  lists,
  onAddCustom,
  onEdit,
  onCreate,
  onImport,
  onDeleted,
}: MyWidgetsPanelProps) {
  const { t } = useTranslation("widgets");
  const save = useSaveWidget();
  const remove = useRemoveWidget();
  const [deleting, setDeleting] = useState<WidgetDocument | null>(null);
  const tilesOf = (widgetId: string) => customTilesOf(lists.items, widgetId) + customTilesOf(lists.mobile, widgetId);

  return (
    <>
      <div className={galleryGrid()} aria-label={t("mine.label")}>
        {widgets.map((widget) => (
          <MyWidgetCard
            key={widget.id}
            widget={widget}
            free={layoutPlacementOf((list) => customTilesOf(lists[list], widget.id) > 0).free}
            onAdd={(targets) => onAddCustom(widget, targets)}
            onEdit={() => onEdit(widget)}
            onDuplicate={() => {
              const name = t("mine.copyName", { name: widget.meta.name });
              save.mutate(duplicateOf(widget, name), {
                onSuccess: () => toast.success(t("mine.duplicated", { name })),
              });
            }}
            onCopyJson={() => copyWidgetJson(exportJsonOf(widget), widget.meta.name)}
            onDelete={() => setDeleting(widget)}
          />
        ))}
        <NewWidgetCard onCreate={onCreate} onImport={onImport} />
      </div>
      {widgets.length === 0 ? <p className={galleryEmpty()}>{t("mine.empty")}</p> : null}
      <DeleteWidgetDialog
        widget={deleting}
        tiles={deleting ? tilesOf(deleting.id) : 0}
        onCancel={() => setDeleting(null)}
        onConfirm={(widget) => {
          setDeleting(null);
          remove.mutate(
            { id: widget.id },
            {
              onSuccess: () => {
                onDeleted(widget.id);
                toast.success(t("mine.deleted", { name: widget.meta.name }));
              },
            }
          );
        }}
      />
    </>
  );
}
