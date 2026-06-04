import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { validateSlskdApiUrl } from "@utils/slskd-url";

import { SlskdStep } from "../SlskdStep";

interface TestResult {
  ok: boolean;
  message?: string;
}

const testMutateAsync = vi.fn<(input: { apiUrl: string; apiKey: string }) => Promise<TestResult>>();
const updateMutateAsync = vi.fn<(input: { apiUrl: string; apiKey: string }) => Promise<unknown>>();

vi.mock("@hooks/api/mutations/settings/useUpdateConnections", () => ({
  useTestSlskd: () => ({ mutateAsync: testMutateAsync }),
  useUpdateConnectionsSlskd: () => ({ mutateAsync: updateMutateAsync }),
}));

const onComplete = vi.fn();

const renderStep = () => render(<SlskdStep stepIndex={1} totalSteps={5} onComplete={onComplete} />);

const fillFields = () => {
  fireEvent.change(screen.getByLabelText("API URL"), { target: { value: "http://localhost:5030" } });
  fireEvent.change(screen.getByLabelText("API Key"), { target: { value: "secret-key" } });
};

const continueButton = () => screen.getByRole("button", { name: "Continue" });
const testButton = () => screen.getByRole("button", { name: "Test connection" });

const runTest = async (result: TestResult) => {
  testMutateAsync.mockResolvedValueOnce(result);
  fireEvent.click(testButton());
  await waitFor(() => expect(testMutateAsync).toHaveBeenCalled());
};

describe("SlskdStep", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateMutateAsync.mockResolvedValue(undefined);
  });

  it("keeps Continue disabled while fields are filled but untested", () => {
    renderStep();
    fillFields();

    expect(continueButton()).toBeDisabled();
  });

  it("shows the verified strip and enables Continue after a successful test", async () => {
    renderStep();
    fillFields();
    await runTest({ ok: true });

    await waitFor(() => expect(screen.getByText("Connection verified.")).toBeInTheDocument());
    expect(continueButton()).toBeEnabled();
  });

  it("shows the error strip with an override action and keeps Continue disabled after a failed test", async () => {
    renderStep();
    fillFields();
    await runTest({ ok: false });

    await waitFor(() =>
      expect(screen.getByText("Could not reach slskd. Check the URL and API key.")).toBeInTheDocument()
    );
    expect(screen.getByRole("button", { name: "Continue without a verified connection" })).toBeInTheDocument();
    expect(continueButton()).toBeDisabled();
  });

  it("arms the override, shows the caution strip, and enables Continue without advancing on the arming click", async () => {
    renderStep();
    fillFields();
    await runTest({ ok: false });

    fireEvent.click(screen.getByRole("button", { name: "Continue without a verified connection" }));

    await waitFor(() =>
      expect(
        screen.getByText("Continuing without a verified connection. You can fix this later in Settings.")
      ).toBeInTheDocument()
    );
    expect(continueButton()).toBeEnabled();
    expect(updateMutateAsync).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("resets to untested when the API URL changes after a passed test", async () => {
    renderStep();
    fillFields();
    await runTest({ ok: true });
    await waitFor(() => expect(screen.getByText("Connection verified.")).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText("API URL"), { target: { value: "http://localhost:9999" } });

    expect(screen.queryByText("Connection verified.")).not.toBeInTheDocument();
    expect(continueButton()).toBeDisabled();
  });

  it("resets to untested when the API Key changes after the override is armed", async () => {
    renderStep();
    fillFields();
    await runTest({ ok: false });
    fireEvent.click(screen.getByRole("button", { name: "Continue without a verified connection" }));
    await waitFor(() =>
      expect(
        screen.getByText("Continuing without a verified connection. You can fix this later in Settings.")
      ).toBeInTheDocument()
    );

    fireEvent.change(screen.getByLabelText("API Key"), { target: { value: "another-key" } });

    expect(
      screen.queryByText("Continuing without a verified connection. You can fix this later in Settings.")
    ).not.toBeInTheDocument();
    expect(continueButton()).toBeDisabled();
  });

  it("advances via onComplete when Continue is pressed after a passed test", async () => {
    renderStep();
    fillFields();
    await runTest({ ok: true });
    await waitFor(() => expect(continueButton()).toBeEnabled());

    fireEvent.click(continueButton());

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(updateMutateAsync).toHaveBeenCalledWith({ apiUrl: "http://localhost:5030", apiKey: "secret-key" });
  });

  it("blocks Test and Continue and shows a hard error for an unparseable URL", () => {
    renderStep();
    fireEvent.change(screen.getByLabelText("API URL"), { target: { value: "host-without-scheme" } });
    fireEvent.change(screen.getByLabelText("API Key"), { target: { value: "secret-key" } });

    const expectedError = validateSlskdApiUrl("host-without-scheme").error;
    expect(screen.getByRole("alert")).toHaveTextContent(expectedError ?? "");
    expect(testButton()).toBeDisabled();
    expect(continueButton()).toBeDisabled();
  });

  it("shows a non-blocking warning for a page-style path URL and still allows testing", () => {
    renderStep();
    fireEvent.change(screen.getByLabelText("API URL"), { target: { value: "http://host:5030/searches" } });
    fireEvent.change(screen.getByLabelText("API Key"), { target: { value: "secret-key" } });

    const expectedWarning = validateSlskdApiUrl("http://host:5030/searches").warning;
    expect(screen.getByText(expectedWarning ?? "")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(testButton()).toBeEnabled();
  });

  it("tests and saves with the normalized base URL when a trailing slash is present", async () => {
    renderStep();
    fireEvent.change(screen.getByLabelText("API URL"), { target: { value: "http://localhost:5030/" } });
    fireEvent.change(screen.getByLabelText("API Key"), { target: { value: "secret-key" } });
    await runTest({ ok: true });

    expect(testMutateAsync).toHaveBeenCalledWith({ apiUrl: "http://localhost:5030", apiKey: "secret-key" });

    await waitFor(() => expect(continueButton()).toBeEnabled());
    fireEvent.click(continueButton());

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(updateMutateAsync).toHaveBeenCalledWith({ apiUrl: "http://localhost:5030", apiKey: "secret-key" });
  });

  it("keeps Continue enabled after a save failure so a second press re-runs the save (N-001)", async () => {
    renderStep();
    fillFields();
    await runTest({ ok: true });
    await waitFor(() => expect(continueButton()).toBeEnabled());

    updateMutateAsync.mockRejectedValueOnce(new Error("save failed"));
    fireEvent.click(continueButton());

    await waitFor(() =>
      expect(
        screen.getByText("Could not save the slskd connection. Confirm the URL and API key, then try again.")
      ).toBeInTheDocument()
    );
    expect(continueButton()).toBeEnabled();
    expect(onComplete).not.toHaveBeenCalled();

    updateMutateAsync.mockResolvedValueOnce(undefined);
    fireEvent.click(continueButton());

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(updateMutateAsync).toHaveBeenCalledTimes(2);
  });
});
