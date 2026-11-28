"use client";

import { useId, useState } from "react";
import { useTranslation } from "react-i18next";

import { authQuietLink, signInMethodsColumn } from "../styles";
import { LoginForm } from "./LoginForm";

export function LocalSignInFold() {
  const { t } = useTranslation("auth");
  const regionId = useId();
  const [open, setOpen] = useState(false);

  return (
    <div className={signInMethodsColumn()}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls={regionId}
        className={authQuietLink()}
      >
        {t("auth.methods.passwordFold")}
      </button>
      {open ? (
        <div id={regionId}>
          <LoginForm />
        </div>
      ) : null}
    </div>
  );
}
