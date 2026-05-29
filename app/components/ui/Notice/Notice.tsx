"use client";

import { useState } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, ChevronDown, Info } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@utils/cn";

import {
  noticeBody,
  noticeChevron,
  noticeHeader,
  noticeIcon,
  noticeRoot,
  noticeTitle,
  noticeTrigger,
} from "./styles";
import type { NoticeProps, NoticeVariant } from "./types";

const DEFAULT_ICONS: Record<NoticeVariant, LucideIcon> = {
  info: Info,
  warning: AlertTriangle,
  danger: AlertCircle,
  success: CheckCircle2,
};

export function Notice({
  variant = "info",
  title,
  icon,
  collapsible = false,
  defaultOpen = true,
  className,
  children,
}: NoticeProps) {
  const [open, setOpen] = useState(defaultOpen);
  const Icon = icon ?? DEFAULT_ICONS[variant];

  const hasBody = Boolean(children);
  const isOpen = collapsible ? open : true;

  const headerContent = (
    <>
      <Icon className={noticeIcon({ variant })} aria-hidden />
      <span className={noticeTitle({ variant })}>{title}</span>
      {collapsible && hasBody ? <ChevronDown className={noticeChevron({ open, variant })} aria-hidden /> : null}
    </>
  );

  return (
    <div className={cn(noticeRoot({ variant }), className)} role={variant === "danger" ? "alert" : "status"}>
      {collapsible && hasBody ? (
        <button
          type="button"
          className={noticeTrigger({ variant })}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {headerContent}
        </button>
      ) : (
        <div className={noticeHeader()}>{headerContent}</div>
      )}

      {hasBody && isOpen ? <div className={noticeBody({ variant })}>{children}</div> : null}
    </div>
  );
}
