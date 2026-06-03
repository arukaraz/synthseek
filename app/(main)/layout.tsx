import { MainLayoutContent } from "@components/MainLayoutContent";
import { BrandedLoader } from "@components/ui/BrandedLoader";
import { AuthGuard } from "@features/auth";
import { Suspense } from "react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <Suspense fallback={<BrandedLoader label="Loading your library" />}>
        <MainLayoutContent>{children}</MainLayoutContent>
      </Suspense>
    </AuthGuard>
  );
}
