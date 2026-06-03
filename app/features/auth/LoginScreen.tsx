"use client";

import { useSetupRedirect } from "@hooks/ui/useSetupRedirect";

import { LoginScreenContent } from "./components/LoginScreenContent";
import { AuthTransitionProvider } from "./hooks/useAuthTransition";

export function LoginScreen() {
  const gate = useSetupRedirect("login");

  if (gate.status !== "ready") return null;

  return (
    <AuthTransitionProvider>
      <LoginScreenContent />
    </AuthTransitionProvider>
  );
}
