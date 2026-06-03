import type { ReactNode } from "react";

import { authLayoutBackdrop, authLayoutRoot } from "./styles";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className={authLayoutRoot()}>
      <div aria-hidden="true" className={authLayoutBackdrop()} />
      <div className="relative z-10 flex w-full justify-center">{children}</div>
    </div>
  );
}
