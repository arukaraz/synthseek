import { Check, CircleAlert, Info, TriangleAlert } from "lucide-react";
import type { ToastIcons } from "./types";

export const TOAST_ICONS: ToastIcons = {
  success: <Check aria-hidden="true" strokeWidth={3} />,
  error: <CircleAlert aria-hidden="true" strokeWidth={2.5} />,
  warning: <TriangleAlert aria-hidden="true" strokeWidth={2.5} />,
  info: <Info aria-hidden="true" strokeWidth={2.5} />,
};
