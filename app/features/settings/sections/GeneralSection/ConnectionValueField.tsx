"use client";

import { Check, Copy } from "lucide-react";
import { useCopiedFlag } from "@hooks/ui/useCopiedFlag";
import { toast } from "sonner";

import { IconButton } from "@components/ui/IconButton";

import { SettingsField } from "../../components/SettingsField";
import { SettingsTextInput } from "../../components/SettingsTextInput";
import { copyRow } from "../../styles";
import type { ConnectionValueFieldProps } from "./types";

export function ConnectionValueField({
  label,
  value,
  helper,
  copyAriaLabel,
  copiedMessage,
  copyFailedMessage,
}: ConnectionValueFieldProps) {
  const { copied, markCopied } = useCopiedFlag();

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      markCopied();
      toast.success(copiedMessage);
    } catch {
      toast.error(copyFailedMessage);
    }
  };

  return (
    <SettingsField label={label} helper={helper}>
      <div className={copyRow()}>
        <div className="flex-1">
          <SettingsTextInput value={value} readOnly />
        </div>
        <IconButton
          icon={copied ? Check : Copy}
          variant="accent"
          size="md"
          onClick={handleCopy}
          disabled={!value}
          aria-label={copyAriaLabel}
          title={copyAriaLabel}
          animated={false}
        />
      </div>
    </SettingsField>
  );
}
