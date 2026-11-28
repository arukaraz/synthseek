"use client";

import { AtSign, KeyRound, User } from "lucide-react";
import { useId, useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { PasswordField } from "@components/ui/PasswordField";
import { useSetupRequired } from "@hooks/api/queries/useSetupRequired";
import { ACCOUNT_FIELD_RULES } from "@utils/account";

import { FieldNote } from "../components/FieldNote";
import { QuestionFrame } from "../components/QuestionFrame";
import { RetryNotice } from "../components/RetryNotice";
import { StatusStrip } from "../components/StatusStrip";
import { StepActions } from "../components/StepActions";
import { TextField } from "../components/TextField";
import { ACCOUNT_FIELD_ORDER, EMPTY_ACCOUNT_DRAFT } from "../constants";
import { accountErrorsOf } from "../helpers";
import { useAccountAttempt } from "../hooks/useAccountAttempt";
import { setupForm } from "../styles";
import type { AccountDraft, AccountFieldErrors } from "../types";

export function AccountStep() {
  const { t } = useTranslation("setup");
  const tokenRequired = useSetupRequired().data?.tokenRequired === true;
  const { state, submit } = useAccountAttempt(tokenRequired);
  const [draft, setDraft] = useState<AccountDraft>(EMPTY_ACCOUNT_DRAFT);
  const [attempted, setAttempted] = useState(false);
  const tokenRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const usernameRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const passwordNoteId = useId();

  const liveErrors = accountErrorsOf(draft, tokenRequired);
  const errors: AccountFieldErrors = attempted ? liveErrors : {};
  const tokenRejected = state.kind === "rejected" && state.failure.kind === "token" ? state.failure.text : null;
  const pending = state.kind === "pending";
  const throttled = state.kind === "throttled";

  const refs = { token: tokenRef, email: emailRef, username: usernameRef, password: passwordRef };

  const edit = (field: keyof AccountDraft) => (value: string) =>
    setDraft((previous) => ({ ...previous, [field]: value }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending || throttled) return;
    setAttempted(true);
    const first = ACCOUNT_FIELD_ORDER.find((field) => liveErrors[field] !== undefined);
    if (first) {
      refs[first].current?.focus();
      return;
    }
    void submit(draft);
  };

  return (
    <QuestionFrame step="account" focusKey="account" title={t("account.title")}>
      <form noValidate onSubmit={handleSubmit} className={setupForm()}>
        {tokenRequired ? (
          <TextField
            label={t("account.tokenLabel")}
            value={draft.token}
            onChange={edit("token")}
            icon={KeyRound}
            autoComplete="off"
            placeholder={t("account.tokenPlaceholder")}
            hint={t("account.tokenHint")}
            error={errors.token ?? tokenRejected}
            inputRef={tokenRef}
          />
        ) : null}
        <TextField
          label={t("account.emailLabel")}
          value={draft.email}
          onChange={edit("email")}
          icon={AtSign}
          type="email"
          autoComplete="email"
          placeholder={t("account.emailPlaceholder")}
          error={errors.email}
          inputRef={emailRef}
        />
        <TextField
          label={t("account.usernameLabel")}
          value={draft.username}
          onChange={edit("username")}
          icon={User}
          autoComplete="username"
          placeholder={t("account.usernamePlaceholder")}
          hint={t("account.usernameHint")}
          error={errors.username}
          minLength={ACCOUNT_FIELD_RULES.usernameMin}
          maxLength={ACCOUNT_FIELD_RULES.usernameMax}
          inputRef={usernameRef}
        />
        <div className="flex flex-col gap-1.5">
          <PasswordField
            id={`${passwordNoteId}-input`}
            value={draft.password}
            onChange={edit("password")}
            invalid={Boolean(errors.password)}
            autoComplete="new-password"
            minLength={ACCOUNT_FIELD_RULES.passwordMin}
            describedBy={passwordNoteId}
            inputRef={passwordRef}
          />
          <FieldNote id={passwordNoteId} tone={errors.password ? "error" : "hint"}>
            {errors.password ?? t("account.passwordHint")}
          </FieldNote>
        </div>
        {state.kind === "throttled" ? (
          <RetryNotice deadline={state.deadline} retryAfterSeconds={state.retryAfterSeconds} />
        ) : null}
        {state.kind === "released" ? <StatusStrip tone="neutral" message={t("account.throttled.released")} /> : null}
        {state.kind === "rejected" && state.failure.kind === "message" ? (
          <StatusStrip tone="error" message={state.failure.text} />
        ) : null}
        <StepActions
          forwardType="submit"
          forwardLabel={pending ? t("account.creating") : t("account.submit")}
          forwardBusy={pending}
          forwardDisabled={throttled}
        />
      </form>
    </QuestionFrame>
  );
}
