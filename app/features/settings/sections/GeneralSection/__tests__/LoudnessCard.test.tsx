import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockMutation } from "@test/mocks/trpc.mock";

const user = vi.hoisted(() => ({
  current: { loudnessNormalization: true, loudnessPreampDb: 0 } as Record<string, unknown> | null,
}));
const setLoudness = vi.hoisted(() => ({ mutation: { mutate: vi.fn(), isPending: false } }));

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({
    currentUser: user.current,
    isLoading: false,
    isError: false,
    isAdmin: true,
    refetch: vi.fn(),
  }),
}));

vi.mock("@hooks/api/mutations/auth/useSetLoudness", () => ({
  useSetLoudness: () => setLoudness.mutation,
}));

import { LoudnessCard } from "../LoudnessCard";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  user.current = { loudnessNormalization: true, loudnessPreampDb: 0 };
});

function preampField(): HTMLElement {
  return screen.getByLabelText(enSettings.general.loudness.preamp.label);
}

describe("the volume normalization card", () => {
  it("shows the listener's own settings", () => {
    user.current = { loudnessNormalization: false, loudnessPreampDb: 6 };

    render(<LoudnessCard />);

    expect(screen.getByRole("switch", { name: enSettings.general.loudness.enabled.label })).toHaveAttribute(
      "aria-checked",
      "false"
    );
    expect(preampField()).toHaveValue(6);
  });

  it("writes the switch straight away, because one click is one decision", () => {
    render(<LoudnessCard />);

    fireEvent.click(screen.getByRole("switch", { name: enSettings.general.loudness.enabled.label }));

    expect(setLoudness.mutation.mutate).toHaveBeenCalledWith({ loudnessNormalization: false });
  });

  it("does NOT write while the listener is still typing a gain", () => {
    render(<LoudnessCard />);

    fireEvent.change(preampField(), { target: { value: "-1" } });
    fireEvent.change(preampField(), { target: { value: "-12" } });

    expect(setLoudness.mutation.mutate).not.toHaveBeenCalled();
    expect(preampField()).toHaveValue(-12);
  });

  it("writes the gain once, when the field is left", () => {
    render(<LoudnessCard />);

    fireEvent.change(preampField(), { target: { value: "-12" } });
    fireEvent.blur(preampField());

    expect(setLoudness.mutation.mutate).toHaveBeenCalledTimes(1);
    expect(setLoudness.mutation.mutate).toHaveBeenCalledWith({ loudnessPreampDb: -12 });
  });

  it("writes nothing when the field is left untouched", () => {
    render(<LoudnessCard />);

    fireEvent.blur(preampField());

    expect(setLoudness.mutation.mutate).not.toHaveBeenCalled();
  });

  it("renders nothing until it knows who is listening", () => {
    user.current = null;

    const { container } = render(<LoudnessCard />);

    expect(container).toBeEmptyDOMElement();
  });
});
