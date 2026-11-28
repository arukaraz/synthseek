import type { A11yToastDuration } from "@modules/accessibility";
import type { Toaster as Sonner, ToastClassnames } from "sonner";
import type { ComponentProps } from "react";

export type ToasterProps = ComponentProps<typeof Sonner>;

export type ToasterOffset = NonNullable<ToasterProps["offset"]>;

export type ToastIcons = NonNullable<ToasterProps["icons"]>;

export type ToastKind = "success" | "info" | "warning" | "error" | "message" | "custom";

export interface ToastDurationInput {
  choice: A11yToastDuration;
  mode: boolean;
  kind: ToastKind;
  hasAction: boolean;
  explicit: number | undefined;
}

export interface ToastPolicy {
  choice: A11yToastDuration;
  mode: boolean;
}

export type { ToastClassnames };
