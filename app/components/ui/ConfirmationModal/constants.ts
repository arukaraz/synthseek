import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ConfirmationVariant } from "./types";

export const VARIANT_ICONS: Record<ConfirmationVariant, LucideIcon> = {
  danger: ShieldAlert,
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle2,
};
