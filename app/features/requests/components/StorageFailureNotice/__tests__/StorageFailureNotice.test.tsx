import { beforeEach, describe, expect, it, vi } from "vitest";

import { MAX_BULK_TRACK_IDS } from "@hooks/api/mutations/requests/constants";
import enRequests from "@modules/i18n/messages/en/requests.json";
import { fireEvent, renderWithProviders, screen } from "@test/test-utils";

import { StorageFailureNotice } from "../StorageFailureNotice";

interface SummaryResult {
  data: { count: number; downloadsPathBroken: boolean; unavailablePaths: string[] } | undefined;
}

const useStorageFailureSummaryMock = vi.fn<() => SummaryResult>();
const mutate = vi.fn();

vi.mock("@hooks/api/queries/useStorageFailureSummary", () => ({
  useStorageFailureSummary: () => useStorageFailureSummaryMock(),
}));

vi.mock("@hooks/api/mutations/requests/useRetryStorageFailures", () => ({
  useRetryStorageFailures: () => ({ mutate, isPending: false }),
}));

beforeEach(() => {
  useStorageFailureSummaryMock.mockReset();
  mutate.mockReset();
});

describe("StorageFailureNotice", () => {
  it("renders nothing while the summary is still loading", () => {
    useStorageFailureSummaryMock.mockReturnValue({ data: undefined });

    const { container } = renderWithProviders(<StorageFailureNotice />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when no failure blames the local disk", () => {
    useStorageFailureSummaryMock.mockReturnValue({
      data: { count: 0, downloadsPathBroken: false, unavailablePaths: [] },
    });

    const { container } = renderWithProviders(<StorageFailureNotice />);

    expect(container).toBeEmptyDOMElement();
  });

  it("offers the retry when the downloads folder is reachable again", () => {
    useStorageFailureSummaryMock.mockReturnValue({
      data: { count: 3, downloadsPathBroken: false, unavailablePaths: [] },
    });

    renderWithProviders(<StorageFailureNotice />);

    expect(screen.getByText(enRequests.storageFailure.pathReachable)).toBeInTheDocument();
    const button = screen.getByRole("button");
    expect(button).not.toBeDisabled();
    expect(button).toHaveTextContent("Retry 3 tracks");

    fireEvent.click(button);
    expect(mutate).toHaveBeenCalledTimes(1);
  });

  it("never promises more than one batch can retry", () => {
    useStorageFailureSummaryMock.mockReturnValue({
      data: { count: 900, downloadsPathBroken: false, unavailablePaths: [] },
    });

    renderWithProviders(<StorageFailureNotice />);

    expect(screen.getByRole("button")).toHaveTextContent(`Retry ${MAX_BULK_TRACK_IDS} tracks`);
    expect(screen.getByText(/run it again for the rest/i)).toBeInTheDocument();
  });

  it("stays silent about batching when everything fits in one attempt", () => {
    useStorageFailureSummaryMock.mockReturnValue({
      data: { count: MAX_BULK_TRACK_IDS, downloadsPathBroken: false, unavailablePaths: [] },
    });

    renderWithProviders(<StorageFailureNotice />);

    expect(screen.queryByText(/run it again for the rest/i)).not.toBeInTheDocument();
  });

  it("blocks the retry while the downloads folder is still unreachable", () => {
    useStorageFailureSummaryMock.mockReturnValue({
      data: { count: 3, downloadsPathBroken: true, unavailablePaths: [] },
    });

    renderWithProviders(<StorageFailureNotice />);

    expect(screen.getByText(enRequests.storageFailure.stillBroken)).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("names the library paths that cannot take music and blocks the retry until they can", () => {
    useStorageFailureSummaryMock.mockReturnValue({
      data: { count: 2, downloadsPathBroken: false, unavailablePaths: ["Archive", "NAS"] },
    });

    renderWithProviders(<StorageFailureNotice />);

    expect(screen.getByText(/The library paths Archive, NAS cannot take music right now/)).toBeInTheDocument();
    expect(screen.queryByText(enRequests.storageFailure.pathReachable)).not.toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("raises the notice to an alert when the disk is still unreachable", () => {
    useStorageFailureSummaryMock.mockReturnValue({
      data: { count: 1, downloadsPathBroken: true, unavailablePaths: [] },
    });

    renderWithProviders(<StorageFailureNotice />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
