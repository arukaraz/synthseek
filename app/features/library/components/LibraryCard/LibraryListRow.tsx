"use client";

import { Checkbox } from "@components/ui/Checkbox";
import { useLongPress } from "@hooks/ui/useLongPress";

import { handleCardActivationKey, onOwnClick } from "./helpers";
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
  const longPress = useLongPress(onHold);
  const activate = () => {
    if (selection?.selecting) selection.onToggle(false);
    else onOpen?.();
  };
  const activates = onOpen !== undefined || selecting;

  return (
    <li
      className={listRow({ selected: selection?.selected === true })}
      role={activates ? "button" : undefined}
      tabIndex={activates ? 0 : undefined}
      aria-label={selecting ? selectLabel : openLabel}
      aria-pressed={selecting ? selection?.selected : undefined}
      onClick={activates ? onOwnClick(activate) : undefined}
      onKeyDown={activates ? (event) => handleCardActivationKey(event, activate) : undefined}
      {...longPress}
    >
      {selecting && selection ? (
        <Checkbox checked={selection.selected} tabIndex={-1} aria-hidden className={listRowCheck()} />
      ) : null}
      <div className={listRowArt({ round })}>{artwork}</div>
      <div className={listRowText()}>
        <p className={listRowTitle()}>{title}</p>
        <p className={listRowSubtitle()}>{subtitle}</p>
      </div>
      {selecting ? null : trailing}
    </li>
  );
}
