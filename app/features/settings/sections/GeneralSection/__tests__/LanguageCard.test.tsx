import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockQuery, createMockMutation, type MockQueryResult } from "@test/mocks/trpc.mock";

interface Me {
  language: string;
}

let meQuery: MockQueryResult<Me | undefined> = createMockQuery<Me | undefined>({ language: "en" });
const setLanguage = createMockMutation();

vi.mock("@utils/trpc", () => ({
  trpc: {
    auth: { me: { useQuery: () => meQuery } },
  },
}));

vi.mock("@hooks/api/mutations/auth/useSetLanguage", () => ({
  useSetLanguage: () => setLanguage,
}));

import { LanguageCard } from "../LanguageCard";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  meQuery = createMockQuery<Me | undefined>({ language: "en" });
});

describe("LanguageCard", () => {
  it("renders the language card title and the current language trigger", () => {
    render(<LanguageCard />);

    expect(screen.getByText(enSettings.general.language.title)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: enSettings.general.language.selectorLabel })).toHaveTextContent(
      "English"
    );
  });

  it("reflects the persisted language from the profile query", () => {
    meQuery = createMockQuery<Me>({ language: "es" });
    render(<LanguageCard />);

    expect(screen.getByRole("button", { name: enSettings.general.language.selectorLabel })).toHaveTextContent(
      "Español"
    );
  });

  it("falls back to the default locale when the profile language is unknown", () => {
    meQuery = createMockQuery<Me>({ language: "xx" });
    render(<LanguageCard />);

    expect(screen.getByRole("button", { name: enSettings.general.language.selectorLabel })).toHaveTextContent(
      "English"
    );
  });

  it("dispatches the chosen locale through the set-language mutation", async () => {
    render(<LanguageCard />);

    await userEvent.click(screen.getByRole("button", { name: enSettings.general.language.selectorLabel }));
    await userEvent.click(await screen.findByRole("menuitemradio", { name: "Español" }));

    expect(setLanguage.mutate).toHaveBeenCalledWith({ language: "es" });
  });
});
