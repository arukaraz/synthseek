"use client";

import { AppLogo } from "@components/ui/AppLogo";
import { BrandedLoader } from "@components/ui/BrandedLoader";

import { useAuthTransition } from "../hooks/useAuthTransition";
import {
  authCard,
  authDivider,
  authDividerLabel,
  authDividerRule,
  authEyebrow,
  authHeader,
  authHelper,
} from "../styles";
import { LoginForm } from "./LoginForm";
import { PlexLoginButton } from "./PlexLoginButton";

export function LoginScreenContent() {
  const { isNavigating } = useAuthTransition();

  if (isNavigating) return <BrandedLoader label="Signing you in" />;

  return (
    <div className={authCard()}>
      <header className={authHeader()}>
        <h1 className="sr-only">Sign in to Synthseek</h1>
        <AppLogo iconClassName="h-11 w-auto sm:h-12" />
        <p className={authEyebrow()}>Welcome back</p>
      </header>

      <PlexLoginButton />

      <div className={authDivider()}>
        <span className={authDividerRule()} />
        <span className={authDividerLabel()}>or with email</span>
        <span className={authDividerRule()} />
      </div>

      <LoginForm />

      <p className={authHelper()}>Don&apos;t have an account? Ask your admin</p>
    </div>
  );
}
