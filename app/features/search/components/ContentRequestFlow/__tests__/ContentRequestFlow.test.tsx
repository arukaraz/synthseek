import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { renderWithProviders, renderHookWithProviders, screen } from "@test/test-utils";

import { ContentRequestFlow, useContentRequestFlow } from "../ContentRequestFlow";

const flowState = vi.hoisted(() => ({
  selectedResult: null as { type: string; id: string; name?: string } | null,
  selectedContentToRequest: null as { type: string; id: string; name?: string } | null,
  openForResult: vi.fn(),
  browserModalProps: { open: false },
  configModalProps: { isOpen: false },
}));

vi.mock("@hooks/ui/useContentRequestModals", () => ({
  useContentRequestModals: () => flowState,
}));

vi.mock("../../ContentBrowserModal/ContentBrowserModal", () => ({
  ContentBrowserModal: ({ type }: { type: string }) => <div data-testid="browser-modal">{type}</div>,
}));

vi.mock("../../ConfigRequestModal/ConfigRequestModal", () => ({
  ConfigRequestModal: () => <div data-testid="config-modal" />,
}));

describe("useContentRequestFlow", () => {
  it("throws when used outside of the provider", () => {
    expect(() => renderHookWithProviders(() => useContentRequestFlow())).toThrow(
      "useContentRequestFlow must be used within ContentRequestFlow"
    );
  });
});

describe("ContentRequestFlow", () => {
  beforeEach(() => {
    flowState.selectedResult = null;
    flowState.selectedContentToRequest = null;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders its children", () => {
    renderWithProviders(
      <ContentRequestFlow>
        <p>flow child</p>
      </ContentRequestFlow>
    );

    expect(screen.getByText("flow child")).toBeInTheDocument();
  });

  it("renders neither modal when nothing is selected", () => {
    renderWithProviders(
      <ContentRequestFlow>
        <p>flow child</p>
      </ContentRequestFlow>
    );

    expect(screen.queryByTestId("browser-modal")).not.toBeInTheDocument();
    expect(screen.queryByTestId("config-modal")).not.toBeInTheDocument();
  });

  it("renders the browser modal for a non-track selection", () => {
    flowState.selectedResult = { type: "album", id: "al1" };

    renderWithProviders(
      <ContentRequestFlow>
        <p>flow child</p>
      </ContentRequestFlow>
    );

    expect(screen.getByTestId("browser-modal")).toHaveTextContent("album");
    expect(screen.queryByTestId("config-modal")).not.toBeInTheDocument();
  });

  it("does not render the browser modal for a track selection", () => {
    flowState.selectedResult = { type: "track", id: "t1" };

    renderWithProviders(
      <ContentRequestFlow>
        <p>flow child</p>
      </ContentRequestFlow>
    );

    expect(screen.queryByTestId("browser-modal")).not.toBeInTheDocument();
  });

  it("renders the config modal when there is content to request", () => {
    flowState.selectedContentToRequest = { type: "track", id: "t1" };

    renderWithProviders(
      <ContentRequestFlow>
        <p>flow child</p>
      </ContentRequestFlow>
    );

    expect(screen.getByTestId("config-modal")).toBeInTheDocument();
  });

  it("exposes openForResult through the context", () => {
    let captured: ((result: unknown) => void) | null = null;

    function Consumer() {
      const flow = useContentRequestFlow();
      captured = flow.openForResult;
      return null;
    }

    renderWithProviders(
      <ContentRequestFlow>
        <Consumer />
      </ContentRequestFlow>
    );

    expect(captured).toBe(flowState.openForResult);
  });
});
