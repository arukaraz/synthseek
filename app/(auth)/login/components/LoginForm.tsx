"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button } from "@components/ui/Button";
import { useLocalLogin } from "@hooks/api/mutations/auth/useLocalLogin";
import { authInput } from "../../styles";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const mutation = useLocalLogin();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await mutation.mutateAsync({ email, password });
      router.replace("/");
    } catch {
      // useLocalLogin already toasts errors
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-fg/70">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
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
          autoComplete="current-password"
          className={authInput()}
        />
      </label>
      <Button type="submit" disabled={mutation.isPending} className="mt-2 w-full">
        {mutation.isPending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
