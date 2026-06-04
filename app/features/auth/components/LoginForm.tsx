"use client";

import { Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { PasswordField } from "@components/ui/PasswordField";
import { useLocalLogin } from "@hooks/api/mutations/auth/useLocalLogin";
import { useAuthTransition } from "../hooks/useAuthTransition";
import { authFieldLabel, authInputControl, authInputIcon, authInputRow, authSubmitButton } from "../styles";

export function LoginForm() {
  const { t } = useTranslation("auth");
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
          {t("auth.form.emailLabel")}
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
            placeholder={t("auth.form.emailPlaceholder")}
            className={authInputControl()}
          />
        </div>
      </div>

      <PasswordField id="login-password" value={password} onChange={setPassword} invalid={mutation.isError} />

      <button type="submit" disabled={mutation.isPending} aria-busy={mutation.isPending} className={authSubmitButton()}>
        {mutation.isPending ? t("auth.form.submitting") : t("auth.form.submit")}
      </button>
    </form>
  );
}
