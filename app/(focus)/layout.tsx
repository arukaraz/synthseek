import { Suspense } from "react";

import { AuthGuard } from "@features/auth";

/**
 * Focused, authenticated pages without the main app shell (no top header / nav).
 * Used for standalone flows like the OAuth consent screen.
 */
export default function FocusLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="bg-surface min-h-dvh" />}>{children}</Suspense>
    </AuthGuard>
  );
}
