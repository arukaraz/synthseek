import type * as DialogPrimitive from "@radix-ui/react-dialog";
import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import type { dialogContent } from "./styles";

export type DialogOverlayProps = ComponentProps<typeof DialogPrimitive.Overlay>;
export type DialogContentProps = ComponentProps<typeof DialogPrimitive.Content> &
  VariantProps<typeof dialogContent> & {
    showClose?: boolean;
  };
export type DialogSurfaceProps = ComponentProps<typeof DialogPrimitive.Content>;
export type DialogTitleProps = ComponentProps<typeof DialogPrimitive.Title>;
export type DialogDescriptionProps = ComponentProps<typeof DialogPrimitive.Description>;
