import type { Toaster as Sonner, ToastClassnames } from "sonner";
import type { ComponentProps } from "react";

export type ToasterProps = ComponentProps<typeof Sonner>;

export type SonnerTheme = NonNullable<ToasterProps["theme"]>;

export type ToasterOffset = NonNullable<ToasterProps["offset"]>;

export type ToastIcons = NonNullable<ToasterProps["icons"]>;

export type { ToastClassnames };
