"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { hrefWithoutCallbackParams } from "@utils/sign-in-callback";

import { callbackFailureFrom } from "../helpers";
import type { CallbackFailure } from "../types";

export function useCallbackFailure(): CallbackFailure | null {
  const router = useRouter();
  const [failure] = useState<CallbackFailure | null>(() =>
    typeof window === "undefined" ? null : callbackFailureFrom(window.location.search)
  );

  useEffect(() => {
    const href = hrefWithoutCallbackParams(window.location);
    if (href !== null) router.replace(href, { scroll: false });
  }, [router]);

  return failure;
}
