"use client";

import { Download, SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useAuthContext } from "@modules/providers/AuthProvider";
import { canCustomizeRequestsFE } from "@utils/authorization";
import { cn } from "@utils/cn";

import { isolated } from "./helpers";
import { splitCustomize, splitDirect, splitGroup, splitIcon } from "./styles";
import type { RequestSplitButtonProps } from "./types";

export function RequestSplitButton({
  name,
  onRequest,
  onCustomize,
  label,
  size = "md",
  tone = "primary",
  fullWidth = false,
  disabled = false,
  disabledReason,
  className,
  dataCy,
}: RequestSplitButtonProps) {
  const { t } = useTranslation("components");
  const { currentUser } = useAuthContext();
  const canCustomize = canCustomizeRequestsFE(currentUser);
  const iconOnly = label === undefined;
  const title = disabled ? (disabledReason ?? undefined) : t("requestSplit.directTitle");

  return (
    <div
      className={cn(splitGroup({ tone, size, fullWidth, disabled }), className)}
      data-cy={dataCy}
      title={disabled ? title : undefined}
    >
      <button
        type="button"
        className={splitDirect({ tone, size, iconOnly, fullWidth })}
        onClick={isolated(onRequest)}
        disabled={disabled}
        aria-label={iconOnly ? t("requestSplit.direct", { name }) : t("requestSplit.directLabelled", { label, name })}
        title={disabled ? undefined : title}
        data-cy={dataCy ? `${dataCy}-direct` : undefined}
      >
        <Download className={splitIcon({ size })} aria-hidden />
        {label}
      </button>
      {canCustomize ? (
        <button
          type="button"
          className={splitCustomize({ tone, size })}
          onClick={isolated(onCustomize)}
          disabled={disabled}
          aria-label={t("requestSplit.customize", { name })}
          title={disabled ? undefined : t("requestSplit.customizeTitle")}
          data-cy={dataCy ? `${dataCy}-customize` : undefined}
        >
          <SlidersHorizontal className={splitIcon({ size })} aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
