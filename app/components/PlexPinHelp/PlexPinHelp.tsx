"use client";

import { Check, Copy } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@components/ui/Button";
import { useCopiedFlag } from "@hooks/ui/useCopiedFlag";
import { useAccessibility } from "@modules/providers/AccessibilityProvider";

import { plexPinCopy, plexPinHelp, plexPinWarning } from "./styles";
import type { PlexPinHelpProps } from "./types";
import { usePinExpiry } from "./usePinExpiry";

export function PlexPinHelp({ session, phase }: PlexPinHelpProps) {
  const { t } = useTranslation("components");
  const { mode } = useAccessibility();
  const { copied, markCopied } = useCopiedFlag();
  const expiring = usePinExpiry(phase === "pending" && mode ? session : null);

  if (!mode || phase !== "pending" || session === null) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(session.authUrl);
      markCopied();
    } catch {
      toast.error(t("a11yMode.plex.copyFailed"));
    }
  };

  return (
    <div className={plexPinHelp()}>
      <Button type="button" variant="secondary" size="sm" className={plexPinCopy()} onClick={() => void copy()}>
        {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
        {copied ? t("a11yMode.plex.copied") : t("a11yMode.plex.copy")}
      </Button>
      <p role="status" className={plexPinWarning({ visible: expiring })}>
        {expiring ? t("a11yMode.plex.expiring") : ""}
      </p>
    </div>
  );
}
