"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { gradientOverlay } from "@theme/utilities/styles";
import { cn } from "@utils/cn";
import { X } from "lucide-react";
import type { HTMLAttributes } from "react";
import { useTranslation } from "react-i18next";
import { closeButton } from "../styles";
import { dialogContent } from "./styles";
import type { DialogContentProps, DialogDescriptionProps, DialogOverlayProps, DialogTitleProps } from "./types";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;

export function DialogOverlay({ className, ref, ...props }: DialogOverlayProps) {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        "bg-surface/90 sm:bg-surface/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 sm:backdrop-blur-md",
        className
      )}
      {...props}
    />
  );
}

export function DialogContent({ className, children, ref, showClose = true, animation, ...props }: DialogContentProps) {
  const { t } = useTranslation("components");
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content ref={ref} className={cn(dialogContent({ animation }), className)} {...props}>
        <div className={gradientOverlay({ direction: "toBr", intensity: "mixed", rounded: "2xl" })} />

        <div className="relative z-10 flex h-full flex-col">{children}</div>

        {showClose && (
          <DialogPrimitive.Close className={closeButton()}>
            <X className="relative size-4" />
            <span className="sr-only">{t("dialog.close", { defaultValue: "Close" })}</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

export function DialogHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />;
}

export function DialogTitle({ className, ref, ...props }: DialogTitleProps) {
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn("text-fg text-lg leading-none font-bold tracking-tight", className)}
      {...props}
    />
  );
}

export function DialogDescription({ className, ref, ...props }: DialogDescriptionProps) {
  return <DialogPrimitive.Description ref={ref} className={cn("text-fg/60 text-sm", className)} {...props} />;
}
