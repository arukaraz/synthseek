"use client";

import {
  gradientOverlay,
  modalBackdrop,
  modalContent as modalContentStyles,
  ghostButton,
} from "@theme/utilities/styles";
import { modalOverlay, modalContent } from "@utils/animations";
import { cn } from "@utils/cn";
import { modalCenterContainer, footerActions } from "./styles";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Info, Sparkles, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type ConfirmationVariant = "danger" | "warning" | "info" | "success";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmationVariant;
  showCancel?: boolean;
}

const variantStyles = {
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

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  showCancel = true,
}: ConfirmationModalProps) {
  const [mounted, setMounted] = useState(false);
  const style = variantStyles[variant];
  const Icon = style.icon;

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  if (!mounted) return null;

  const modal = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={modalOverlay}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(modalBackdrop({ responsive: "blur" }), "z-9999")}
            onClick={onClose}
          />

          <div className={modalCenterContainer()}>
            <motion.div
              variants={modalContent}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="pointer-events-auto w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={cn(modalContentStyles({ responsive: "blur" }), style.borderColor)}>
                <div className={gradientOverlay({ direction: "toBr", intensity: "mixed", rounded: "none" })} />

                <motion.div
                  className={cn(
                    "decorative-animation absolute -inset-px rounded-2xl opacity-20 blur-xl",
                    style.iconGlow
                  )}
                  animate={{
                    opacity: [0.1, 0.2, 0.1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                <div className="relative p-6 pb-4">
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <motion.div
                        className={cn(
                          "decorative-animation absolute inset-0 rounded-full opacity-30 blur-lg",
                          style.iconGlow
                        )}
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />

                      <div className={cn("bg-fg/5 relative rounded-full border p-3", style.borderColor)}>
                        <Icon className={cn("relative z-10 h-6 w-6", style.iconColor)} />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <h3 className="text-fg text-lg font-bold">{title}</h3>
                        <div className="decorative-animation">
                          <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <Sparkles className={cn("h-3.5 w-3.5", style.iconColor)} />
                          </motion.div>
                        </div>
                      </div>
                      <p className="text-fg/60 text-sm leading-relaxed">{message}</p>
                    </div>
                  </div>
                </div>

                <div className={footerActions()}>
                  {showCancel && (
                    <motion.button
                      onClick={onClose}
                      className={cn(
                        ghostButton({ size: "md", hover: "lift", variant: "muted" }),
                        "flex-1 font-semibold"
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {cancelText}
                    </motion.button>
                  )}
                  <motion.button
                    onClick={handleConfirm}
                    className={cn(
                      "text-fg rounded-xl px-4 py-3 text-sm font-bold transition-all",
                      showCancel ? "flex-1" : "w-full",
                      style.confirmBg,
                      style.confirmGlow
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {confirmText}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modal, document.body);
}
