import { AlertCircle, CheckCircle2, Info, type LucideIcon } from "lucide-react";

import type { StatusStripTone } from "../types";

export const STATUS_STRIP_GLYPH: Record<StatusStripTone, LucideIcon> = {
  success: CheckCircle2,
  error: AlertCircle,
  neutral: Info,
};
