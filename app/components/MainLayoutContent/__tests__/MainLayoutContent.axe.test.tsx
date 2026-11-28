import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { expectNoAxeViolations } from "@test/a11y/axe";
import { renderWithProviders } from "@test/test-utils";

import { MainLayoutContent } from "../MainLayoutContent";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/library",
}));

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ currentUser: { username: "ada", avatar_url: null }, isAdmin: true }),
}));

vi.mock("@hooks/api/subscriptions", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@hooks/api/subscriptions")>()),
  useSubscriptions: () => undefined,
  useRehydrateRequestDock: () => undefined,
  useRehydratePlaylistSyncDock: () => undefined,
  useReviewApprovalDock: () => undefined,
  useVersionState: () => ({ updateAvailable: false, latestVersion: null, currentVersion: "1.0.0" }),
}));

vi.mock("@hooks/api/queries/useSearchContent", () => ({ useSearchContent: () => ({ data: undefined }) }));

vi.mock("@features/search/components/ContentRequestFlow", () => ({
  ContentRequestFlow: ({ children }: { children: ReactNode }) => <>{children}</>,
  useContentRequestFlow: () => ({ openForResult: vi.fn() }),
}));

vi.mock("@features/settings/components/WhatsNew", () => ({ WhatsNewGate: () => null }));
vi.mock("@components/SystemStatusBanner", () => ({ SystemStatusBanner: () => null }));
vi.mock("@components/ThemePreviewStrip", () => ({ ThemePreviewStrip: () => null }));
vi.mock("@components/PlayerDock", () => ({ PlayerDock: () => null }));
vi.mock("@components/Player", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@components/Player")>()),
  PlaybackSourcePicker: () => null,
}));

describe("the app layout", () => {
  it("holds one main and no axe violation around a page", async () => {
    renderWithProviders(
      <MainLayoutContent>
        <section aria-labelledby="page-title">
          <h1 id="page-title">Library</h1>
        </section>
      </MainLayoutContent>
    );

    expect(document.querySelectorAll("main, [role='main']")).toHaveLength(1);
    await expectNoAxeViolations();
  });
});
