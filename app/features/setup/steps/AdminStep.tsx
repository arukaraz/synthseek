"use client";

import { useState, type FormEvent } from "react";

import { useSetupBootstrap } from "@hooks/api/mutations/auth/useSetupBootstrap";

import { wizardShell as authInput } from "../styles";
import { StepShell } from "./StepShell";
import type { AdminStepProps } from "../types";

export function AdminStep({ stepIndex, totalSteps, onComplete }: AdminStepProps) {
  const bootstrap = useSetupBootstrap();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    try {
      await bootstrap.mutateAsync({ email, username, password });
      onComplete();
    } catch {
      /* toast handled by hook */
    }
  };

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void submit();
  };

  const disabled = email.length === 0 || username.length < 3 || password.length < 8;

  return (
    <form onSubmit={handleFormSubmit}>
      <StepShell
        stepIndex={stepIndex}
        totalSteps={totalSteps}
        title="Create your admin account"
        description="This is the first account on this Synthseek install. You can invite others later."
        primaryLabel="Create admin"
        primaryDisabled={disabled}
        primaryLoading={bootstrap.isPending}
        onPrimary={submit}
      >
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
      </StepShell>
    </form>
  );
}
