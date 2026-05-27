import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

export const variantStyles = {
  danger: {
    icon: XCircle,
    iconColor: "text-red-400",
    iconGlow: "bg-red-500",
    borderColor: "border-red-500/30",
    confirmBg: "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600",
    confirmGlow: "shadow-lg shadow-red-500/30",
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-yellow-400",
    iconGlow: "bg-yellow-500",
    borderColor: "border-yellow-500/30",
    confirmBg: "bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600",
    confirmGlow: "shadow-lg shadow-yellow-500/30",
  },
  info: {
    icon: Info,
    iconColor: "text-secondary-400",
    iconGlow: "bg-secondary-500",
    borderColor: "border-secondary-500/30",
    confirmBg: "bg-gradient-to-r from-secondary-600 to-secondary-500 hover:from-secondary-500 hover:to-secondary-600",
    confirmGlow: "shadow-lg shadow-secondary-500/30",
  },
  success: {
    icon: CheckCircle,
    iconColor: "text-green-400",
    iconGlow: "bg-green-500",
    borderColor: "border-green-500/30",
    confirmBg: "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-600",
    confirmGlow: "shadow-lg shadow-green-500/30",
  },
};
