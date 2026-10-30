"use client";

import { Button } from "@components/ui/Button";

import { actionBar, actionBarButton, actionBarButtons, actionBarEnd, actionBarStart } from "./styles";
import type { ModalActionBarProps } from "./types";

export function ModalActionBar({ start, choice, cancel, save }: ModalActionBarProps) {
  return (
    <div className={actionBar()}>
      {start ? <div className={actionBarStart()}>{start}</div> : null}
      <div className={actionBarEnd()}>
        {choice}
        <div className={actionBarButtons()}>
          <Button
            variant="ghost"
            size="sm"
            onClick={cancel.onClick}
            disabled={cancel.disabled}
            className={actionBarButton()}
          >
            {cancel.label}
          </Button>
          <Button size="sm" onClick={save.onClick} disabled={save.disabled} className={actionBarButton()}>
            {save.label}
          </Button>
        </div>
      </div>
    </div>
  );
}
