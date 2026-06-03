import type * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ComponentProps } from "react";

export type DialogOverlayProps = ComponentProps<typeof DialogPrimitive.Overlay>;
export type DialogContentProps = ComponentProps<typeof DialogPrimitive.Content> & {
  showClose?: boolean;
};
export type DialogTitleProps = ComponentProps<typeof DialogPrimitive.Title>;
export type DialogDescriptionProps = ComponentProps<typeof DialogPrimitive.Description>;
