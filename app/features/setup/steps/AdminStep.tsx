"use client";

import { useId, useState, type FormEvent } from "react";

import { Input } from "@components/ui/Input";
import { useSetupBootstrap } from "@hooks/api/mutations/auth/useSetupBootstrap";

import { StatusStrip } from "../components/StatusStrip";
import { ADMIN_COPY, ADMIN_FIELD_RULES, SETUP_HEADING_IDS } from "../constants";
import { isValidAdminEmail } from "../helpers";
import { fieldError, fieldGroup, fieldHint, fieldLabel } from "../styles";
import { StepShell } from "./StepShell";
import type { AdminStepProps } from "../types";

export function AdminStep({ stepIndex, totalSteps, onComplete }: AdminStepProps) {
  const bootstrap = useSetupBootstrap();
  const emailId = useId();
  const emailErrorId = useId();
  const usernameId = useId();
  const usernameHintId = useId();
  const passwordId = useId();
  const passwordHintId = useId();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    try {
      await bootstrap.mutateAsync({ email, username, password });
      onComplete();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create the admin account. Please try again.");
    }
  };

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void submit();
  };

  const emailValid = isValidAdminEmail(email);
  const usernameValid =
    username.length >= ADMIN_FIELD_RULES.usernameMin && username.length <= ADMIN_FIELD_RULES.usernameMax;
  const passwordValid = password.length >= ADMIN_FIELD_RULES.passwordMin;
  const emailInvalid = email.length > 0 && !emailValid;
  const usernameInvalid = username.length > 0 && !usernameValid;
  const passwordInvalid = password.length > 0 && !passwordValid;

  const disabled = !emailValid || !usernameValid || !passwordValid;

  const clearError = () => {
    if (error) setError(null);
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <StepShell
        stepIndex={stepIndex}
        totalSteps={totalSteps}
        headingId={SETUP_HEADING_IDS.admin}
        title="Create your admin account"
        description="This is the first account on this Synthseek install. You can invite others later."
        primaryLabel={bootstrap.isPending ? "Creating admin..." : "Create admin"}
        primaryDisabled={disabled}
        primaryLoading={bootstrap.isPending}
        primaryType="submit"
        footerError={error ? <StatusStrip tone="error" message={error} /> : undefined}
      >
        <div className={fieldGroup()}>
          <label htmlFor={emailId} className={fieldLabel()}>
            Email
          </label>
          <Input
            id={emailId}
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearError();
            }}
            required
            aria-describedby={emailInvalid ? emailErrorId : undefined}
            aria-invalid={emailInvalid || undefined}
          />
          {emailInvalid ? (
            <p id={emailErrorId} className={fieldError()}>
              {ADMIN_COPY.emailError}
            </p>
          ) : null}
        </div>
        <div className={fieldGroup()}>
          <label htmlFor={usernameId} className={fieldLabel()}>
            Username
          </label>
          <Input
            id={usernameId}
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              clearError();
            }}
            required
            minLength={ADMIN_FIELD_RULES.usernameMin}
            maxLength={ADMIN_FIELD_RULES.usernameMax}
            aria-describedby={usernameHintId}
            aria-invalid={usernameInvalid || undefined}
          />
          <p id={usernameHintId} className={usernameInvalid ? fieldError() : fieldHint()}>
            {usernameInvalid ? ADMIN_COPY.usernameError : ADMIN_COPY.usernameHint}
          </p>
        </div>
        <div className={fieldGroup()}>
          <label htmlFor={passwordId} className={fieldLabel()}>
            Password
          </label>
          <Input
            id={passwordId}
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearError();
            }}
            required
            minLength={ADMIN_FIELD_RULES.passwordMin}
            aria-describedby={passwordHintId}
            aria-invalid={passwordInvalid || undefined}
          />
          <p id={passwordHintId} className={passwordInvalid ? fieldError() : fieldHint()}>
            {passwordInvalid ? ADMIN_COPY.passwordError : ADMIN_COPY.passwordHint}
          </p>
        </div>
      </StepShell>
    </form>
  );
}
