"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { gradientOverlay } from "@theme/utilities/styles";
import { cn } from "@utils/cn";
import { X } from "lucide-react";
import type { HTMLAttributes } from "react";
import { closeButton } from "../styles";
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

export function DialogContent({ className, children, ref, ...props }: DialogContentProps) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "border-fg/10 bg-surface/95 sm:bg-surface/90 fixed left-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] gap-6 rounded-2xl border p-6 shadow-2xl duration-200 sm:backdrop-blur-2xl",
          "top-4 max-h-[calc(100dvh-1rem-env(safe-area-inset-bottom,0px))] overflow-y-auto",
          "sm:top-[50%] sm:max-h-[90vh] sm:translate-y-[-50%]",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          className
        )}
        {...props}
      >
        <div className={gradientOverlay({ direction: "toBr", intensity: "mixed", rounded: "2xl" })} />

        <div className="relative z-10 flex h-full flex-col">{children}</div>

        <DialogPrimitive.Close className={closeButton()}>
          <X className="size-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
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
