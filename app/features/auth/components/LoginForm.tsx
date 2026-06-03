"use client";

import { Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { PasswordField } from "@components/ui/PasswordField";
import { useLocalLogin } from "@hooks/api/mutations/auth/useLocalLogin";
import { useAuthTransition } from "../hooks/useAuthTransition";
import { authFieldLabel, authInputControl, authInputIcon, authInputRow, authSubmitButton } from "../styles";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const mutation = useLocalLogin();
  const { markNavigating } = useAuthTransition();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await mutation.mutateAsync({ email, password });
      markNavigating();
      router.replace("/");
    } catch {
      // useLocalLogin already toasts errors
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="login-email" className={authFieldLabel()}>
          Email
        </label>
        <div className={authInputRow({ invalid: mutation.isError })}>
          <Mail className={authInputIcon()} aria-hidden="true" />
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@domain.com"
            className={authInputControl()}
          />
        </div>
      </div>

      <PasswordField id="login-password" value={password} onChange={setPassword} invalid={mutation.isError} />

      <button type="submit" disabled={mutation.isPending} aria-busy={mutation.isPending} className={authSubmitButton()}>
        {mutation.isPending ? "Signing in..." : "Sign in with email"}
      </button>
    </form>
  );
}
