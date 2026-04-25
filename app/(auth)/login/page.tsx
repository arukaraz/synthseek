"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { trpc } from "@utils/trpc";
import { useCurrentUser } from "@modules/providers/AuthProvider";
import { LoginForm } from "./components/LoginForm";
import { PlexLoginButton } from "./components/PlexLoginButton";
import { authCard } from "../styles";

export default function LoginPage() {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const setupQuery = trpc.auth.setupRequired.useQuery(undefined, {
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (setupQuery.data === true) {
      router.replace("/setup");
      return;
    }
    if (currentUser) {
      router.replace("/");
    }
  }, [currentUser, router, setupQuery.data]);

  if (setupQuery.isLoading) return null;

  return (
    <div className={authCard()}>
      <header className="flex flex-col gap-1 text-center">
        <h1 className="text-fg text-2xl font-bold">Welcome back</h1>
        <p className="text-fg/60 text-sm">Sign in to manage your library.</p>
      </header>
      <LoginForm />
      <div className="flex items-center gap-3">
        <span className="bg-fg/10 h-px flex-1" />
        <span className="text-fg/40 text-xs">or</span>
        <span className="bg-fg/10 h-px flex-1" />
      </div>
      <PlexLoginButton />
    </div>
  );
}
