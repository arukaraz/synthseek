import { CircleAlert, Info } from "lucide-react";

import { signInNotice, signInNoticeBody, signInNoticeGlyph } from "../styles";
import type { SignInNoticeProps } from "../types";

export function SignInNotice({ tone, id, children }: SignInNoticeProps) {
  const Glyph = tone === "error" ? CircleAlert : Info;

  return (
    <div id={id} role={tone === "error" ? "alert" : "status"} className={signInNotice({ tone })}>
      <Glyph aria-hidden="true" className={signInNoticeGlyph()} />
      <span className={signInNoticeBody()}>{children}</span>
    </div>
  );
}
