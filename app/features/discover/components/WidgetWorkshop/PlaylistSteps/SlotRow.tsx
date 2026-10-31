"use client";

import { Pin, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { IconButton } from "@components/ui/IconButton";
import { Input } from "@components/ui/Input";
import { SelectMenu } from "@components/ui/SelectMenu";

import { paramKindOf, withOrigin, withParam, withSlot } from "./helpers";
import { SlotParam } from "./SlotParam";
import { slotActions, slotCell, slotMessage, slotName, slotNumber, slotRow } from "./styles";
import type { SlotRowProps } from "./types";

export function SlotRow({ slot, index, set, grammar, result, onChange }: SlotRowProps) {
  const { t } = useTranslation("widgets");
  const shown = slot.name.trim().length > 0 ? slot.name : slot.label;
  const update = (change: Parameters<typeof withSlot>[2]) => onChange((current) => withSlot(current, slot.id, change));
  const kind = paramKindOf(grammar, slot.origin);
  const alone = kind === "none";
  const hidden = result?.hidden.find((entry) => entry.slotId === slot.id);

  return (
    <div className={slotRow()}>
      <span className={slotNumber()}>{index + 1}</span>
      <span className={slotCell({ alone })}>
        <SelectMenu
          ariaLabel={t("set.origin")}
          value={slot.origin}
          options={grammar.origins.map((origin) => ({ value: origin.key, label: t(`set.origins.${origin.key}`) }))}
          onChange={(origin) => update((current) => withOrigin(current, grammar, origin))}
        />
      </span>
      {kind === "none" ? null : (
        <span className={slotCell()}>
          <SlotParam
            slot={slot}
            kind={kind}
            grammar={grammar}
            onChange={(param) => update((current) => withParam(current, grammar, param))}
          />
        </span>
      )}
      <span className={slotName({ wide: alone })}>
        <Input
          aria-label={t("set.listName")}
          placeholder={slot.label}
          maxLength={grammar.limits.nameMax}
          value={slot.name}
          onChange={(event) => {
            const name = event.target.value;
            update((current) => ({ ...current, name }));
          }}
        />
      </span>
      <span className={slotActions()}>
        <IconButton
          icon={Pin}
          size="sm"
          animated={false}
          aria-pressed={slot.pinned}
          aria-label={t(slot.pinned ? "set.unpin" : "set.pin", { name: shown })}
          title={t(slot.pinned ? "set.unpin" : "set.pin", { name: shown })}
          onClick={() => update((current) => ({ ...current, pinned: !current.pinned }))}
        />
        <IconButton
          icon={Trash2}
          size="sm"
          animated={false}
          disabled={set.slots.length === 1}
          aria-label={t("set.removeList", { name: shown })}
          onClick={() =>
            onChange((current) => ({ ...current, slots: current.slots.filter((entry) => entry.id !== slot.id) }))
          }
        />
      </span>
      {hidden && hidden.found !== null ? (
        <span className={slotMessage()}>{t("set.hiddenSlot", { found: hidden.found, min: set.mix.minTracks })}</span>
      ) : null}
    </div>
  );
}
