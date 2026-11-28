"use client";

import { Notice } from "@components/ui/Notice";
import { resolveFriendlyError } from "@modules/errors";
import { cn } from "@utils/cn";

import { inlineError } from "./styles";
import type { InlineErrorProps } from "./types";

export function InlineError({ error, className }: InlineErrorProps) {
  if (error === null || error === undefined) return null;
  const friendly = resolveFriendlyError(error);

  return (
    <div className={cn(inlineError(), className)} data-inline-error>
      <Notice variant="danger" title={friendly.title}>
        {friendly.description}
      </Notice>
    </div>
  );
}
