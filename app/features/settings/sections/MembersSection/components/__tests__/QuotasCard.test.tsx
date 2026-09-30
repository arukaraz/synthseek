import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

interface QuotasGroup {
  tracksPerWindow: number;
  windowDays: number;
  userStorageGb: number;
  libraryStorageGb: number;
}

interface Spies {
  mutateAsync: ReturnType<typeof vi.fn>;
  settingsData: { quotas: QuotasGroup } | undefined;
}

const QUOTAS: QuotasGroup = { tracksPerWindow: 100, windowDays: 7, userStorageGb: 50, libraryStorageGb: 0 };

const spies = vi.hoisted<Spies>(() => ({ mutateAsync: vi.fn(), settingsData: undefined }));

vi.mock("@hooks/api/queries/useSettings", () => ({
  useSettings: () => ({ data: spies.settingsData, isLoading: false, isError: false }),
}));

vi.mock("@hooks/api/mutations/settings/useUpdateQuotas", () => ({
  useUpdateQuotas: () => ({ mutateAsync: spies.mutateAsync, isPending: false }),
}));

import { QuotasCard } from "../QuotasCard";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

describe("QuotasCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    spies.mutateAsync.mockResolvedValue({ ok: true });
    spies.settingsData = { quotas: { ...QUOTAS } };
  });

  it("renders nothing until the settings have loaded", () => {
    spies.settingsData = undefined;
    const { container } = render(<QuotasCard />);
    expect(container).toBeEmptyDOMElement();
  });

  it("seeds every quota from the fetched quotas group", () => {
    render(<QuotasCard />);

    expect(screen.getByText(enSettings.members.quotas.cardTitle)).toBeInTheDocument();
    expect(screen.getByLabelText(enSettings.members.quotas.tracksPerWindow.ariaLabel)).toHaveValue(100);
    expect(screen.getByLabelText(enSettings.members.quotas.windowDays.ariaLabel)).toHaveValue(7);
    expect(screen.getByLabelText(enSettings.members.quotas.userStorageGb.ariaLabel)).toHaveValue(50);
    expect(screen.getByLabelText(enSettings.members.quotas.libraryStorageGb.ariaLabel)).toHaveValue(0);
  });

  it("saves the whole quotas group after one value changes", async () => {
    const user = userEvent.setup();
    render(<QuotasCard />);

    fireEvent.change(screen.getByLabelText(enSettings.members.quotas.tracksPerWindow.ariaLabel), {
      target: { value: "25" },
    });
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => expect(spies.mutateAsync).toHaveBeenCalledWith({ ...QUOTAS, tracksPerWindow: 25 }));
  });
});
