import { afterEach, describe, expect, it, vi } from "vitest";

import type { LbConfig } from "@features/discovery-integrations/types";
import enDiscover from "@modules/i18n/messages/en/discover.json";
import { fireEvent, renderWithProviders, screen } from "@test/test-utils";

import { DiscoveryMixes } from "../DiscoveryMixes";
import type { DiscoveryMix } from "../types";
import { createCandidate, createEmptyMix, createReadyMix } from "./fixtures";

interface MixesResult {
  lbConfig: LbConfig | undefined;
  mixes: DiscoveryMix[];
  isLoading: boolean;
  isError: boolean;
}

const useDiscoveryMixesMock = vi.fn<() => MixesResult>();
const openForTarget = vi.fn();

vi.mock("@hooks/api/queries/discovery/useDiscoveryMixes", () => ({
  useDiscoveryMixes: () => useDiscoveryMixesMock(),
}));

vi.mock("@features/search/components/ContentRequestFlow", () => ({
  useContentRequestFlow: () => ({ openForResult: vi.fn(), openForTarget }),
}));

vi.mock("../DiscoveryMixCard", () => ({
  DiscoveryMixCard: ({ mix, onClick }: { mix: DiscoveryMix; onClick: () => void }) => (
    <button type="button" data-testid="ready-card" data-kind={mix.kind} onClick={onClick} />
  ),
}));

vi.mock("../DiscoveryMixCardEmpty", () => ({
  DiscoveryMixCardEmpty: ({ mix }: { mix: DiscoveryMix }) => <div data-testid="empty-card" data-kind={mix.kind} />,
}));

function buildConfig(overrides: Partial<LbConfig> = {}): LbConfig {
  return {
    enabled: true,
    username: "listener",
    selectedKinds: ["daily-jams"],
    autoRequest: false,
    playlistNames: {},
    ...overrides,
  } as LbConfig;
}

function buildResult(overrides: Partial<MixesResult> = {}): MixesResult {
  return {
    lbConfig: buildConfig(),
    mixes: [createReadyMix()],
    isLoading: false,
    isError: false,
    ...overrides,
  };
}

describe("DiscoveryMixes", () => {
  afterEach(() => {
    vi.clearAllMocks();
    useDiscoveryMixesMock.mockReset();
  });

  it("renders the skeleton while loading", () => {
    useDiscoveryMixesMock.mockReturnValue(buildResult({ isLoading: true }));

    const { container } = renderWithProviders(<DiscoveryMixes />);

    expect(container.querySelector(".animate-pulse")).not.toBeNull();
    expect(screen.queryByTestId("ready-card")).not.toBeInTheDocument();
  });

  it("renders the error empty state when the query errors", () => {
    useDiscoveryMixesMock.mockReturnValue(buildResult({ isError: true }));

    renderWithProviders(<DiscoveryMixes />);

    expect(screen.getByText(enDiscover.mixes.empty.error)).toBeInTheDocument();
  });

  it("renders the disabled empty state when ListenBrainz is off", () => {
    useDiscoveryMixesMock.mockReturnValue(buildResult({ lbConfig: buildConfig({ enabled: false }) }));

    renderWithProviders(<DiscoveryMixes />);

    expect(screen.getByText(enDiscover.mixes.empty.disabled)).toBeInTheDocument();
  });

  it("renders the disabled empty state when the config is missing", () => {
    useDiscoveryMixesMock.mockReturnValue(buildResult({ lbConfig: undefined }));

    renderWithProviders(<DiscoveryMixes />);

    expect(screen.getByText(enDiscover.mixes.empty.disabled)).toBeInTheDocument();
  });

  it("renders the no-username empty state when the username is empty", () => {
    useDiscoveryMixesMock.mockReturnValue(buildResult({ lbConfig: buildConfig({ username: "" }) }));

    renderWithProviders(<DiscoveryMixes />);

    expect(screen.getByText(enDiscover.mixes.empty.noUsername)).toBeInTheDocument();
  });

  it("renders the no-kinds empty state when no mixes are selected", () => {
    useDiscoveryMixesMock.mockReturnValue(buildResult({ mixes: [] }));

    renderWithProviders(<DiscoveryMixes />);

    expect(screen.getByText(enDiscover.mixes.empty.noKinds)).toBeInTheDocument();
  });

  it("renders a ready card for ready mixes and an empty card for empty mixes", () => {
    useDiscoveryMixesMock.mockReturnValue(
      buildResult({
        lbConfig: buildConfig({ selectedKinds: ["daily-jams", "weekly-jams"] }),
        mixes: [createReadyMix({ kind: "daily-jams" }), createEmptyMix({ kind: "weekly-jams" })],
      })
    );

    renderWithProviders(<DiscoveryMixes />);

    expect(screen.getByTestId("ready-card")).toHaveAttribute("data-kind", "daily-jams");
    expect(screen.getByTestId("empty-card")).toHaveAttribute("data-kind", "weekly-jams");
    expect(screen.getByRole("heading", { name: enDiscover.mixes.title })).toBeInTheDocument();
  });

  it("opens the request flow with a synthesized playlist target when a ready card is clicked", () => {
    useDiscoveryMixesMock.mockReturnValue(
      buildResult({
        mixes: [
          createReadyMix({
            kind: "daily-jams",
            generatedAt: "2026-05-25T07:00:00.000Z",
            candidates: [createCandidate({ catalogTrackId: "a" }), createCandidate({ catalogTrackId: "b" })],
          }),
        ],
      })
    );

    renderWithProviders(<DiscoveryMixes />);
    fireEvent.click(screen.getByTestId("ready-card"));

    expect(openForTarget).toHaveBeenCalledTimes(1);
    const target = openForTarget.mock.calls[0][0];
    expect(target.id).toBe("discovery:listenbrainz:daily-jams:2026-05-25T07:00:00.000Z");
    expect(target.preloadedTracks).toHaveLength(2);
    expect(target.requestDisabled).toBe(false);
  });

  it("disables requesting and supplies the auto-request tooltip when autoRequest is on", () => {
    useDiscoveryMixesMock.mockReturnValue(
      buildResult({
        lbConfig: buildConfig({ autoRequest: true }),
        mixes: [createReadyMix({ candidates: [createCandidate()] })],
      })
    );

    renderWithProviders(<DiscoveryMixes />);
    fireEvent.click(screen.getByTestId("ready-card"));

    const target = openForTarget.mock.calls[0][0];
    expect(target.requestDisabled).toBe(true);
    expect(target.requestDisabledTooltip).toBe(enDiscover.mixes.autoRequestTooltip);
  });

  it("applies a custom playlist name from config when present", () => {
    useDiscoveryMixesMock.mockReturnValue(
      buildResult({
        lbConfig: buildConfig({ playlistNames: { "daily-jams": "My Picks" } }),
        mixes: [createReadyMix({ kind: "daily-jams", generatedAt: "2026-05-25T07:00:00.000Z" })],
      })
    );

    renderWithProviders(<DiscoveryMixes />);
    fireEvent.click(screen.getByTestId("ready-card"));

    const target = openForTarget.mock.calls[0][0];
    expect(target.name).toBe("My Picks (May 25 2026)");
  });
});
