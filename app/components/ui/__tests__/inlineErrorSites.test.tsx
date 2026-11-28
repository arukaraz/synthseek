import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createMockMutation, createMockQuery, type MockMutationResult } from "@test/mocks/trpc.mock";

import { ImportWidgetDialog } from "@features/discover/components/WidgetGallery/ImportWidgetDialog";
import { ImportPlexUsersDialog } from "@features/settings/sections/MembersSection/components/ImportPlexUsersDialog";

const mutations = vi.hoisted(() => ({
  importUsers: null as MockMutationResult | null,
  importWidget: null as MockMutationResult | null,
}));

vi.mock("@hooks/api/queries/usePlexImportableUsers", () => ({
  usePlexImportableUsers: () => createMockQuery([]),
}));

vi.mock("@hooks/api/mutations/users/useImportPlexUsers", () => ({
  useImportPlexUsers: () => mutations.importUsers,
}));

vi.mock("@hooks/api/mutations/widgets/useImportWidgetPreview", () => ({
  useImportWidgetPreview: () => mutations.importWidget,
}));

afterEach(() => {
  cleanup();
});

function inlineMessages(): string[] {
  return Array.from(document.querySelectorAll("[data-inline-error]")).map((node) => node.textContent ?? "");
}

describe("an inline error sits next to the submit that failed", () => {
  it("in the Plex member import", () => {
    mutations.importUsers = createMockMutation({ error: new Error("Plex refused the import") });

    render(<ImportPlexUsersDialog open onOpenChange={vi.fn()} />);

    expect(inlineMessages().join(" ")).toContain("Plex refused the import");
  });

  it("in the widget import", () => {
    mutations.importWidget = createMockMutation({ error: new Error("That widget could not be read") });

    render(<ImportWidgetDialog open onClose={vi.fn()} onImported={vi.fn()} />);

    expect(inlineMessages().join(" ")).toContain("That widget could not be read");
  });

  it("and shows nothing while nothing has failed", () => {
    mutations.importUsers = createMockMutation();
    mutations.importWidget = createMockMutation();

    render(<ImportPlexUsersDialog open onOpenChange={vi.fn()} />);
    render(<ImportWidgetDialog open onClose={vi.fn()} onImported={vi.fn()} />);

    expect(inlineMessages()).toEqual([]);
  });
});

const WIRED = [
  ["features/settings/sections/LibrarySection/LibraryRuleModal.tsx", "create.error ?? update.error"],
  ["features/settings/sections/LibrarySection/LibraryPathModal.tsx", "create.error ?? update.error"],
  ["features/settings/sections/LibrarySection/PreviewModal.tsx", "apply.error"],
  ["features/settings/sections/MembersSection/components/MemberRequestPresetDialog.tsx", "save.error"],
  ["features/unidentified-files/components/MatchSongPanel.tsx", "assign.error ?? ignore.error ?? resolveLink.error"],
  ["features/unidentified-files/components/MatchAlbumPanel.tsx", "assign.error ?? ignore.error ?? resolveLink.error"],
  ["components/LibrarySourceModal/LibrarySourceModal.tsx", "save.error"],
  ["features/search/components/ConfigRequestModal/ConfigRequestModal.tsx", "delegateArtistMutation.error"],
  ["features/requests/components/RequestDetail/RejectApprovalDialog.tsx", "failure"],
] as const;

describe("the other submits that can fail", () => {
  it.each(WIRED)("%s hands %s to the shared inline error", (file, expression) => {
    const source = readFileSync(join(resolve(process.cwd(), "app"), file), "utf8");

    expect(source).toContain('from "@components/ui/InlineError"');
    expect(source).toContain(`<InlineError error={${expression}}`);
  });
});
