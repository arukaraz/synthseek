"use client";

import { Checkbox } from "@components/ui/Checkbox";
import { useListPosition } from "@hooks/ui/useListPosition";
import { useLongPress } from "@hooks/ui/useLongPress";
import { listPositionAttributes } from "@utils/list-position";

import { onOwnClick } from "./helpers";
import { RowPrimaryButton } from "./RowPrimaryButton";
import { listRow, listRowArt, listRowCheck, listRowSubtitle, listRowText, listRowTitle } from "./styles";
import type { LibraryListRowProps } from "./types";

export function LibraryListRow({
  title,
  subtitle,
  openLabel,
  artwork,
  round = false,
  onOpen,
  trailing,
  selection,
  selectLabel,
  onHold,
}: LibraryListRowProps) {
  const selecting = selection?.selecting === true;
  const position = useListPosition();
  const longPress = useLongPress(onHold);
  const activate = () => {
    if (selection?.selecting) selection.onToggle(false);
    else onOpen?.();
  };
  const activates = onOpen !== undefined || selecting;

  return (
    <li
      {...listPositionAttributes(position)}
      className={listRow({ selected: selection?.selected === true })}
      onClick={activates ? onOwnClick(activate) : undefined}
      {...longPress}
    >
      {selecting && selection ? (
        <Checkbox checked={selection.selected} tabIndex={-1} aria-hidden className={listRowCheck()} />
      ) : null}
      <div className={listRowArt({ round })}>{artwork}</div>
      <div className={listRowText()}>
        <p className={listRowTitle()}>
          {activates ? (
            <RowPrimaryButton
              label={selecting ? (selectLabel ?? openLabel) : openLabel}
              pressed={selecting ? selection?.selected : undefined}
            >
              {title}
            </RowPrimaryButton>
          ) : (
            title
          )}
        </p>
        <p className={listRowSubtitle()}>{subtitle}</p>
      </div>
      {selecting ? null : trailing}
    </li>
  );
}
