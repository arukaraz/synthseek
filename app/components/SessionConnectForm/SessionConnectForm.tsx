"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { Notice } from "@components/ui/Notice";
import { Spinner } from "@components/ui/Spinner";
import { useConnectLibrarySession } from "@hooks/api/mutations/library-source/useConnectLibrarySession";
import { resolveFriendlyError, type FriendlyError } from "@modules/errors";
import { announce } from "@utils/announcer";

import { sessionActions, sessionCopy, sessionField, sessionForm } from "./styles";
import type { SessionConnectFormProps } from "./types";

export function SessionConnectForm({ source, reconnect = false, onConnected }: SessionConnectFormProps) {
  const { t } = useTranslation("components");
  const connect = useConnectLibrarySession();
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const inFlight = useRef(false);
  const [hasText, setHasText] = useState(false);
  const [failure, setFailure] = useState<FriendlyError | null>(null);
  const fieldId = useId();
  const howToId = useId();
  const warningId = useId();
  const provider = source.name;
  const busy = connect.isPending;
  const unavailable = !source.configured;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const field = fieldRef.current;
    if (field === null || inFlight.current) return;
    const session = field.value;
    if (session.trim() === "") return;
    field.value = "";
    setHasText(false);
    setFailure(null);
    inFlight.current = true;
    connect
      .mutateAsync({ provider: source.provider, session })
      .then(() => {
        announce(t("sessionConnect.connected", { provider }));
        onConnected?.();
      })
      .catch((caught: unknown) => setFailure(resolveFriendlyError(caught)))
      .finally(() => {
        inFlight.current = false;
        connect.reset();
      });
  };

  return (
    <form className={sessionForm()} onSubmit={handleSubmit} data-session-form>
      <p id={howToId} className={sessionCopy()}>
        {t("sessionConnect.howTo", { provider })} {t("sessionConnect.kept", { provider })}
      </p>
      <div id={warningId}>
        <Notice variant="warning" title={t("sessionConnect.warningTitle", { provider })}>
          {t("sessionConnect.warningBody", { provider })}
        </Notice>
      </div>
      <label htmlFor={fieldId} className="text-fg text-xs font-medium">
        {t("sessionConnect.label")}
      </label>
      <textarea
        id={fieldId}
        ref={fieldRef}
        className={sessionField()}
        placeholder={t("sessionConnect.placeholder")}
        aria-describedby={`${howToId} ${warningId}`}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        disabled={busy || unavailable}
        onChange={(event) => {
          setHasText(event.target.value.trim() !== "");
          setFailure(null);
        }}
      />
      {failure ? (
        <Notice variant="danger" title={failure.title}>
          {failure.description}
        </Notice>
      ) : null}
      <div className={sessionActions()}>
        <Button type="submit" size="sm" disabled={!hasText || busy || unavailable}>
          {busy ? <Spinner size="sm" decorative /> : null}
          {busy
            ? t("sessionConnect.submitting")
            : reconnect
              ? t("sessionConnect.reconnect", { provider })
              : t("sessionConnect.submit", { provider })}
        </Button>
      </div>
    </form>
  );
}
