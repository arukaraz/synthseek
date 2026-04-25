"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@components/ui/Button";
import { trpc } from "@utils/trpc";
import { useSetupBootstrap } from "@hooks/api/mutations/auth/useSetupBootstrap";
import { authCard, authInput } from "../styles";

export default function SetupPage() {
  const router = useRouter();
  const setupQuery = trpc.auth.setupRequired.useQuery();
  const mutation = useSetupBootstrap();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (setupQuery.data === false) {
      router.replace("/login");
    }
  }, [router, setupQuery.data]);

  if (setupQuery.isLoading || setupQuery.data === false) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await mutation.mutateAsync({ email, username, password });
      router.replace("/");
    } catch {
      // toasted by useSetupBootstrap
    }
  };

  return (
    <div className={authCard()}>
      <header className="flex flex-col gap-1 text-center">
        <h1 className="text-fg text-2xl font-bold">Set up Synthseek</h1>
        <p className="text-fg/60 text-sm">Create the first admin account.</p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-fg/70">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={authInput()}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-fg/70">Username</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            maxLength={32}
            className={authInput()}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-fg/70">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className={authInput()}
          />
        </label>
        <Button type="submit" disabled={mutation.isPending} className="mt-2 w-full">
          {mutation.isPending ? "Creating..." : "Create admin"}
        </Button>
      </form>
    </div>
  );
}
