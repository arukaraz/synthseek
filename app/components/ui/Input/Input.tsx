"use client";

import { cn } from "@utils/cn";
import { inputVariants } from "./styles";
import type { InputProps } from "./types";

export function Input({ className, size, ref, ...props }: InputProps) {
  return <input ref={ref} className={cn(inputVariants({ size }), className)} {...props} />;
}
