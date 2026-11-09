import { cn } from "@utils/cn";
import { ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

import { adminOnlyMark } from "./styles";
import type { AdminOnlyMarkProps } from "./types";

export function AdminOnlyMark({ className }: AdminOnlyMarkProps) {
  const { t } = useTranslation("components");
  const label = t("adminOnly.label");
  return (
    <span role="img" aria-label={label} title={label} className={cn(adminOnlyMark(), className)}>
      <ShieldCheck aria-hidden className="size-3" />
    </span>
  );
}
