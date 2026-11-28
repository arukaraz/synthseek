"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { hrefWithoutCallbackParams } from "@utils/sign-in-callback";

import { NO_LINK_OUTCOME } from "../constants";
import { linkOutcomeOf } from "../helpers";
import type { LinkCallbackOutcome } from "../types";

export function useLinkCallback(): LinkCallbackOutcome {
  const router = useRouter();
  const [outcome] = useState<LinkCallbackOutcome>(() =>
    typeof window === "undefined" ? NO_LINK_OUTCOME : linkOutcomeOf(window.location.search)
  );

  useEffect(() => {
    const href = hrefWithoutCallbackParams(window.location);
    if (href !== null) router.replace(href, { scroll: false });
  }, [router]);

  return outcome;
}
