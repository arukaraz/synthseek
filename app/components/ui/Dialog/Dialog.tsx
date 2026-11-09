"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { gradientOverlay } from "@theme/utilities/styles";
import { cn } from "@utils/cn";
import { X } from "lucide-react";
import { type HTMLAttributes, use } from "react";
import { useTranslation } from "react-i18next";
import { closeButton } from "../styles";
import { DialogCloseShownContext } from "./context";
import { keepOpenForToasts } from "./helpers";
import { dialogContent, dialogFrame, dialogHeader } from "./styles";
import type {
  DialogContentProps,
  DialogDescriptionProps,
  DialogOverlayProps,
  DialogSurfaceProps,
  DialogTitleProps,
} from "./types";

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

export function DialogContent({
  className,
  children,
  ref,
  showClose = true,
  animation,
  overlayClassName,
  onInteractOutside,
  ...props
}: DialogContentProps) {
  const { t } = useTranslation("components");
  return (
    <DialogPortal>
      <DialogOverlay className={overlayClassName} />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(dialogContent({ animation }), className)}
        onInteractOutside={keepOpenForToasts(onInteractOutside)}
        {...props}
      >
        <div className={gradientOverlay({ direction: "toBr", intensity: "mixed", rounded: "2xl" })} />

        <DialogCloseShownContext value={showClose}>
          <div className={dialogFrame()}>{children}</div>
        </DialogCloseShownContext>

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

export function DialogSurface({ className, children, ref, onInteractOutside, ...props }: DialogSurfaceProps) {
  return (
    <DialogPortal>
      <DialogPrimitive.Content
        ref={ref}
        className={className}
        onInteractOutside={keepOpenForToasts(onInteractOutside)}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

export function DialogHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const closeShown = use(DialogCloseShownContext);
  return <div className={cn(dialogHeader({ closeShown }), className)} {...props} />;
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
