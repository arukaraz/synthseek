"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { useUpdateAccessibility } from "@hooks/api/mutations/auth/useUpdateAccessibility";
import { setMonoAudio } from "@hooks/ui/player/audio-graph";
import { useMotionReduced } from "@hooks/ui/useMotionReduced";
import { useMoreContrast, useTransparencyReduced } from "@hooks/ui/useResolvedAccessibility";
import {
  applyAccessibilityAttributes,
  applyTextSize,
  DEFAULT_ACCESSIBILITY,
  DEFAULT_TEXT_SIZE,
  readAccessibilityCookie,
  sameAccessibilityCookie,
  writeGuestAccessibilityCookies,
  writeTextSize,
  type AccessibilityCookie,
  type AccessibilitySettings,
  type TextSize,
} from "@modules/accessibility";
import { useAuthContext } from "@modules/providers/AuthProvider";

import { FALLBACK_ACCESSIBILITY_CONTEXT } from "./constants";
import type { AccessibilityContextValue, AccessibilityProviderProps } from "./types";

const AccessibilityContext = createContext<AccessibilityContextValue>(FALLBACK_ACCESSIBILITY_CONTEXT);

export function AccessibilityProvider({
  boot,
  textSizeBoot = DEFAULT_TEXT_SIZE,
  children,
}: AccessibilityProviderProps) {
  const { currentUser, isLoading, isError } = useAuthContext();
  const { mutate } = useUpdateAccessibility();
  const signedIn = currentUser !== null;
  const signedOut = !signedIn && !isLoading && !isError;
  const [guest, setGuest] = useState<AccessibilityCookie>(boot);
  const [textSize, setTextSizeState] = useState<TextSize>(textSizeBoot);
  const [pending, setPending] = useState<Partial<AccessibilitySettings>>({});
  const inFlight = useRef(0);
  const account = currentUser?.accessibility ?? null;

  const values = useMemo<AccessibilitySettings>(
    () => ({ ...(account ?? { ...DEFAULT_ACCESSIBILITY, ...guest }), ...pending }),
    [account, guest, pending]
  );
  const latest = useRef(values);
  latest.current = values;

  const { mode, motion, transparency, contrast, buttonNames, monoAudio } = values;

  useEffect(() => {
    applyAccessibilityAttributes(document.documentElement, { mode, motion, transparency, contrast, buttonNames });
  }, [mode, motion, transparency, contrast, buttonNames]);

  useEffect(() => {
    setMonoAudio(monoAudio);
  }, [monoAudio]);

  useEffect(() => {
    if (!signedOut) return;
    const stored = readAccessibilityCookie();
    setGuest((current) => (sameAccessibilityCookie(current, stored) ? current : stored));
  }, [signedOut]);

  const motionReduced = useMotionReduced();
  const transparencyReduced = useTransparencyReduced();
  const moreContrast = useMoreContrast();

  const update = useCallback(
    (partial: Partial<AccessibilitySettings>) => {
      const next: AccessibilitySettings = { ...latest.current, ...partial };
      latest.current = next;
      applyAccessibilityAttributes(document.documentElement, next);
      if (!signedIn) {
        const stored: AccessibilityCookie = {
          mode: next.mode,
          motion: next.motion,
          transparency: next.transparency,
          contrast: next.contrast,
          buttonNames: next.buttonNames,
        };
        writeGuestAccessibilityCookies(stored);
        setGuest(stored);
        return;
      }
      inFlight.current += 1;
      setPending((current) => ({ ...current, ...partial }));
      mutate(
        { accessibility: partial },
        {
          onSettled: () => {
            inFlight.current -= 1;
            if (inFlight.current === 0) setPending({});
          },
        }
      );
    },
    [mutate, signedIn]
  );

  const setTextSize = useCallback((size: TextSize) => {
    writeTextSize(size);
    applyTextSize(document.documentElement, size);
    setTextSizeState(size);
  }, []);

  const value = useMemo<AccessibilityContextValue>(
    () => ({ ...values, motionReduced, transparencyReduced, moreContrast, signedIn, update, textSize, setTextSize }),
    [values, motionReduced, transparencyReduced, moreContrast, signedIn, update, textSize, setTextSize]
  );

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibility(): AccessibilityContextValue {
  return useContext(AccessibilityContext);
}
