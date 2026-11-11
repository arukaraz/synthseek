"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useDismissWhatsNew } from "@hooks/api/mutations/updates/useDismissWhatsNew";
import { useWhatsNew } from "@hooks/api/queries/useWhatsNew";

import { WhatsNewDialog } from "./WhatsNewDialog";
import { openButton, openButtonIcon } from "./styles";

export function WhatsNewButton() {
  const { t } = useTranslation("settings");
  const { data } = useWhatsNew();
  const dismiss = useDismissWhatsNew();
  const [open, setOpen] = useState(false);

  const entry = data?.entry;
  if (!entry) return null;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next && data.pending) dismiss.mutate({ version: entry.version });
  };

  return (
    <>
      <button type="button" className={openButton()} onClick={() => setOpen(true)}>
        <Sparkles className={openButtonIcon()} />
        {t("updates.whatsNew.open")}
      </button>
      <WhatsNewDialog entry={entry} mediaPath={data.mediaPath} open={open} onOpenChange={handleOpenChange} />
    </>
  );
}
