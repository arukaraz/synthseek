import { MainLayoutContent } from "@components/MainLayoutContent";
import { AuthGuard } from "@features/auth";
import { Suspense } from "react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="bg-surface min-h-screen" />}>
        <MainLayoutContent>{children}</MainLayoutContent>
      </Suspense>
    </AuthGuard>
  );
}
