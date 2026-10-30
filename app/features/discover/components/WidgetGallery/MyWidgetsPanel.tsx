"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { useRemoveWidget } from "@hooks/api/mutations/widgets/useRemoveWidget";
import { useSaveWidget } from "@hooks/api/mutations/widgets/useSaveWidget";
import type { WidgetDocument } from "@hooks/api/queries/widgets/types";

import { DeleteWidgetDialog } from "./DeleteWidgetDialog";
import { customTilesOf, duplicateOf, exportJsonOf } from "./helpers";
import { MyWidgetCard } from "./MyWidgetCard";
import { NewWidgetCard } from "./NewWidgetCard";
import { galleryEmpty, galleryGrid } from "./styles";
import type { MyWidgetsPanelProps } from "./types";

export function MyWidgetsPanel({ widgets, items, onAddCustom, onEdit, onCreate, onImport }: MyWidgetsPanelProps) {
  const { t } = useTranslation("widgets");
  const save = useSaveWidget();
  const remove = useRemoveWidget();
  const [deleting, setDeleting] = useState<WidgetDocument | null>(null);

  return (
    <>
      <div className={galleryGrid()} aria-label={t("mine.label")}>
        {widgets.map((widget) => (
          <MyWidgetCard
            key={widget.id}
            widget={widget}
            tiles={customTilesOf(items, widget.id)}
            onAdd={() => onAddCustom(widget)}
            onEdit={() => onEdit(widget)}
            onDuplicate={() => {
              const name = t("mine.copyName", { name: widget.meta.name });
              save.mutate(duplicateOf(widget, name), {
                onSuccess: () => toast.success(t("mine.duplicated", { name })),
              });
            }}
            onCopyJson={() => {
              void navigator.clipboard
                .writeText(exportJsonOf(widget))
                .then(() => toast.success(t("mine.jsonCopied", { name: widget.meta.name })))
                .catch(() => toast.error(t("mine.jsonCopyFailed")));
            }}
            onDelete={() => setDeleting(widget)}
          />
        ))}
        <NewWidgetCard onCreate={onCreate} onImport={onImport} />
      </div>
      {widgets.length === 0 ? <p className={galleryEmpty()}>{t("mine.empty")}</p> : null}
      <DeleteWidgetDialog
        widget={deleting}
        tiles={deleting ? customTilesOf(items, deleting.id) : 0}
        onCancel={() => setDeleting(null)}
        onConfirm={(widget) => {
          setDeleting(null);
          remove.mutate(
            { id: widget.id },
            { onSuccess: () => toast.success(t("mine.deleted", { name: widget.meta.name })) }
          );
        }}
      />
    </>
  );
}
