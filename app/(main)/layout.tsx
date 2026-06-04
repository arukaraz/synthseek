import { LibraryLoader } from "@components/LibraryLoader";
import { MainLayoutContent } from "@components/MainLayoutContent";
import { AuthGuard } from "@features/auth";
import { Suspense } from "react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <Suspense fallback={<LibraryLoader />}>
        <MainLayoutContent>{children}</MainLayoutContent>
      </Suspense>
    </AuthGuard>
  );
}
