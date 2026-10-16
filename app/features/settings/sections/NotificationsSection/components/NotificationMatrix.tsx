"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";

import { Checkbox } from "@components/ui/Checkbox";
import { useOverflowsX } from "@hooks/ui/useOverflowsX";

import { availableKinds, categorySelection, countSelected, withCategory, withKind } from "../helpers";
import {
  matrixCategoryButton,
  matrixCategoryCount,
  matrixCell,
  matrixCellCount,
  matrixCellInner,
  matrixColumnHead,
  matrixColumnName,
  matrixHead,
  matrixKindLabel,
  matrixKindRow,
  matrixRowHead,
  matrixScroll,
  matrixTable,
} from "../styles";
import type { NotificationCategoryId, NotificationMatrixProps } from "../types";
import { ChannelMark } from "./ChannelMark";
import { MatrixPresetMenu } from "./MatrixPresetMenu";

export function NotificationMatrix({ categories, columns, kindsOf, onKindsChange }: NotificationMatrixProps) {
  const { t } = useTranslation("settings");
  const [scrollRef, overflowsX] = useOverflowsX<HTMLDivElement>();
  const [expanded, setExpanded] = useState<ReadonlySet<NotificationCategoryId>>(new Set());
  const available = availableKinds(categories);

  const toggleCategory = (id: NotificationCategoryId) =>
    setExpanded((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div ref={scrollRef} className={matrixScroll({ viewport: overflowsX })}>
      <table className={matrixTable()}>
        <thead className={matrixHead()}>
          <tr>
            <th scope="col" className={matrixRowHead()}>
              {t("notifications.matrix.notification")}
            </th>
            {columns.map((channel) => (
              <th key={channel} scope="col" className={matrixColumnHead()}>
                <span className={matrixColumnName()}>
                  <ChannelMark channel={channel} size="sm" />
                  {t(`notifications.channels.${channel}`)}
                </span>
                <MatrixPresetMenu
                  channel={channel}
                  selectedCount={countSelected(available, kindsOf(channel))}
                  others={columns.filter((other) => other !== channel)}
                  available={available}
                  kindsOf={kindsOf}
                  onApply={(kinds) => onKindsChange(channel, kinds)}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => {
            const title = t(`notifications.categories.${category.id}`);
            const open = expanded.has(category.id);
            return (
              <Fragment key={category.id}>
                <tr className={matrixKindRow({ group: true })}>
                  <th scope="row" className={matrixRowHead()}>
                    <button
                      type="button"
                      className={matrixCategoryButton()}
                      aria-expanded={open}
                      onClick={() => toggleCategory(category.id)}
                    >
                      {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                      {title}
                      <span className={matrixCategoryCount()}>{category.kinds.length}</span>
                    </button>
                  </th>
                  {columns.map((channel) => {
                    const selected = kindsOf(channel);
                    const state = categorySelection(category.kinds, selected);
                    return (
                      <td key={channel} className={matrixCell()}>
                        <span className={matrixCellInner()}>
                          <Checkbox
                            checked={state}
                            onCheckedChange={() =>
                              onKindsChange(channel, withCategory(category.kinds, selected, state !== true))
                            }
                            aria-label={t("notifications.matrix.categoryTo", {
                              category: title,
                              channel: t(`notifications.channels.${channel}`),
                            })}
                          />
                          <span className={matrixCellCount()}>
                            {t("notifications.matrix.count", {
                              selected: countSelected(category.kinds, selected),
                              total: category.kinds.length,
                            })}
                          </span>
                        </span>
                      </td>
                    );
                  })}
                </tr>
                {open
                  ? category.kinds.map((kind) => {
                      const label = t(`notifications.kinds.${kind}`);
                      return (
                        <tr key={kind} className={matrixKindRow({ group: false })}>
                          <th scope="row" className={matrixKindLabel()}>
                            {label}
                          </th>
                          {columns.map((channel) => {
                            const selected = kindsOf(channel);
                            return (
                              <td key={channel} className={matrixCell()}>
                                <span className={matrixCellInner()}>
                                  <Checkbox
                                    checked={selected.includes(kind)}
                                    onCheckedChange={(checked) =>
                                      onKindsChange(channel, withKind(selected, kind, checked === true))
                                    }
                                    aria-label={t("notifications.matrix.kindTo", {
                                      kind: label,
                                      channel: t(`notifications.channels.${channel}`),
                                    })}
                                  />
                                  <span className={matrixCellCount()} />
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                  : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
