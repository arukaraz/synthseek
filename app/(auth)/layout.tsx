import type { ReactNode } from "react";

import { AuthScene } from "@components/AuthScene";

import { authLayoutContent, authLayoutRoot } from "./styles";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className={authLayoutRoot()} data-theme="dark">
      <AuthScene />
      <div className={authLayoutContent()}>{children}</div>
    </div>
  );
}
