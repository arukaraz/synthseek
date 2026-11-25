"use client";

import { ConfirmationModal } from "@components/ui/ConfirmationModal";
import { ListX } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { labelled } from "./helpers";
import { abovePlayerPanels, iconButton, queueHeader, queueHeaderActions } from "./styles";
import type { QueueHeaderProps } from "./types";

export function QueueHeader({ view, actions, title, closeIcon }: QueueHeaderProps) {
  const { t } = useTranslation("player");
  const [confirmingClear, setConfirmingClear] = useState(false);

  return (
    <div className={queueHeader()}>
      {title}
      <div className={queueHeaderActions()}>
        {view.queueEditable ? (
          <button
            type="button"
            className={iconButton()}
            onClick={() => setConfirmingClear(true)}
            {...labelled(t("queue.clear"))}
          >
            <ListX className="size-4" />
          </button>
        ) : null}
        <button type="button" className={iconButton()} onClick={actions.toggleQueue} {...labelled(t("queue.close"))}>
          {closeIcon}
        </button>
      </div>
      <ConfirmationModal
        isOpen={confirmingClear}
        onClose={() => setConfirmingClear(false)}
        onConfirm={actions.clearQueue}
        title={t("queue.clearTitle")}
        message={t("queue.clearMessage")}
        confirmText={t("queue.clear")}
        variant="danger"
        className={abovePlayerPanels()}
        overlayClassName={abovePlayerPanels()}
      />
    </div>
  );
}
