import { afterEach, describe, expect, it, vi } from "vitest";

import { createWidgetCatalog, createWidgetGrammar, createWidgetPreset } from "@test/factories";
import { fireEvent, render, screen, within } from "@test/test-utils";

import { SmartRuleDialog } from "../SmartRuleDialog";

function refreshPicker() {
  return within(screen.getByRole("radiogroup", { name: "Refresh" }));
}

const { savePlaylist, saveWidget, toastSuccess } = vi.hoisted(() => ({
  savePlaylist: vi.fn(),
  saveWidget: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("sonner", () => ({ toast: { success: toastSuccess } }));
vi.mock("@modules/providers/CountryProvider", () => ({ useCountry: () => ({ country: "MX" }) }));
vi.mock("@hooks/api/queries/widgets/useWidgetCatalog", () => ({
  useWidgetCatalog: () => ({ data: createWidgetCatalog() }),
}));
vi.mock("@hooks/api/queries/widgets/useWidgetGrammar", () => ({
  useWidgetGrammar: () => ({ data: createWidgetGrammar() }),
}));
vi.mock("@hooks/api/queries/widgets/useWidgetPresets", () => ({
  useWidgetPresets: () => ({ data: [createWidgetPreset()] }),
}));
vi.mock("@hooks/api/queries/widgets/useWidgetPreview", () => ({
  useWidgetPreview: () => ({ data: undefined, isLoading: false, isError: false }),
}));
const ruleState = vi.hoisted(() => ({ failed: false }));

vi.mock("@hooks/api/queries/widgets/useSmartPlaylistRule", () => ({
  useSmartPlaylistRule: () => ({
    isError: ruleState.failed,
    data: ruleState.failed
      ? undefined
      : {
          name: "On repeat",
          refresh: "weekly",
          timeZone: "UTC",
          query: {
            type: "recipe",
            subject: "tracks",
            measure: "plays",
            time: { mode: "relative", days: 14 },
            pick: { by: "plays", order: "desc", limit: 8, random: null },
          },
        },
  }),
}));
vi.mock("@hooks/api/queries/widgets/useWidgetHousehold", () => ({
  useWidgetHousehold: () => ({ data: [] }),
}));
vi.mock("@hooks/api/mutations/widgets/useSaveSmartPlaylist", () => ({
  useSaveSmartPlaylist: () => ({ mutate: savePlaylist, isPending: false }),
}));
vi.mock("@hooks/api/mutations/widgets/useSaveWidget", () => ({
  useSaveWidget: () => ({ mutate: saveWidget, isPending: false }),
}));
vi.mock("@hooks/api/queries/widgets/useSetGrammar", () => ({ useSetGrammar: () => ({ data: undefined }) }));
vi.mock("@hooks/ui/useDebounce", () => ({ useDebounce: <T,>(value: T) => value }));
vi.mock("@hooks/ui/useEntityPlayback", () => ({ useEntityPlayback: () => ({ playEntity: vi.fn() }) }));
vi.mock("@features/search/components/ContentRequestFlow", () => ({
  useContentRequestFlow: () => ({ openForTarget: vi.fn(), requestResult: vi.fn() }),
}));

afterEach(() => {
  vi.clearAllMocks();
  ruleState.failed = false;
});

describe("SmartRuleDialog", () => {
  it("says the rule could not be loaded instead of loading forever", () => {
    ruleState.failed = true;
    render(<SmartRuleDialog playlistId="pl_gone" open onOpenChange={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "The rule could not be loaded" })).toBeInTheDocument();
  });

  it("opens the workshop on the playlist's rule with only the recipe and the playlist", () => {
    render(<SmartRuleDialog playlistId="pl_1" open onOpenChange={vi.fn()} />);

    expect(screen.getByRole("heading", { level: 2, name: "Rule of On repeat" })).toBeInTheDocument();
    expect(screen.getByText("Show me 8 tracks with the most plays in the last 14 days.")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Look" })).not.toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Feed" })).not.toBeInTheDocument();
    expect(refreshPicker().getByRole("radio", { name: "Weekly" })).toHaveAttribute("aria-checked", "true");
  });

  it("saves the rule onto the same playlist and never makes a widget", () => {
    const onOpenChange = vi.fn();
    savePlaylist.mockImplementation((_input, options) => options.onSuccess({ id: "pl_1", name: "Repeat" }));
    render(<SmartRuleDialog playlistId="pl_1" open onOpenChange={onOpenChange} />);

    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), { target: { value: "Repeat" } });
    fireEvent.click(refreshPicker().getByRole("radio", { name: "Daily" }));
    fireEvent.click(screen.getByRole("button", { name: "Save rule" }));

    expect(savePlaylist).toHaveBeenCalledWith(
      expect.objectContaining({ playlistId: "pl_1", name: "Repeat", refresh: "daily" }),
      expect.anything()
    );
    expect(saveWidget).not.toHaveBeenCalled();
    expect(toastSuccess).toHaveBeenCalledWith("Saved the rule of Repeat");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
