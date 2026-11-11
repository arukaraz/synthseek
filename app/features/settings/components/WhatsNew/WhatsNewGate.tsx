"use client";

import { useEffect, useState } from "react";

import { useDismissWhatsNew } from "@hooks/api/mutations/updates/useDismissWhatsNew";
import { useWhatsNew } from "@hooks/api/queries/useWhatsNew";

import { WhatsNewDialog } from "./WhatsNewDialog";
import { WHATS_NEW_FIRST_CHECK_MS, WHATS_NEW_RETRY_MS } from "./constants";
import { anotherDialogOpen } from "./helpers";

export function WhatsNewGate() {
  const { data } = useWhatsNew();
  const dismiss = useDismissWhatsNew();
  const [open, setOpen] = useState(false);
  const [closedVersion, setClosedVersion] = useState<string | null>(null);

  const entry = data?.entry ?? null;
  const due = data?.pending === true && entry !== null && closedVersion !== entry.version;

  useEffect(() => {
    if (!due || open) return;
    const tick = () => {
      if (anotherDialogOpen()) return;
      window.clearTimeout(first);
      window.clearInterval(retry);
      setOpen(true);
    };
    const first = window.setTimeout(tick, WHATS_NEW_FIRST_CHECK_MS);
    const retry = window.setInterval(tick, WHATS_NEW_RETRY_MS);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(retry);
    };
  }, [due, open]);

  if (!entry) return null;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) return;
    setClosedVersion(entry.version);
    dismiss.mutate({ version: entry.version });
  };

  return <WhatsNewDialog entry={entry} open={open} onOpenChange={handleOpenChange} />;
}
