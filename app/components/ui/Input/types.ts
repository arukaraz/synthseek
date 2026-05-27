import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import type { inputVariants } from "./styles";

export interface InputProps extends Omit<ComponentProps<"input">, "size">, VariantProps<typeof inputVariants> {}
