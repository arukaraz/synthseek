"use client";

import { cn } from "@utils/cn";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { SectionLoadingProps } from "./types";

export function SectionLoading({ message, className }: SectionLoadingProps) {
  const { t } = useTranslation("components");
  return (
    <motion.div
      className={cn("flex h-full flex-col items-center justify-center p-8 text-center", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Loader2 className="text-primary-500 mb-4 h-8 w-8 animate-spin" />
      <p className="text-fg/50 text-sm">{message ?? t("loading.section", { defaultValue: "Loading..." })}</p>
    </motion.div>
  );
}
