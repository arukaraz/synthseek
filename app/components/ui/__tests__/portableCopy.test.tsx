import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createInstance } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import type { ReactNode } from "react";

import { Pagination } from "../Pagination";
import { Spinner } from "../Spinner";
import { PasswordField } from "../PasswordField";

function HostWithoutKeys({ children }: { children: ReactNode }) {
  const bare = createInstance();
  void bare.use(initReactI18next).init({
    lng: "en",
    fallbackLng: "en",
    resources: { en: {} },
    defaultNS: "common",
    react: { useSuspense: false },
  });
  return <I18nextProvider i18n={bare}>{children}</I18nextProvider>;
}

describe("copy survives a host project that has none of these keys", () => {
  it("Pagination renders English rather than raw keys", () => {
    render(
      <HostWithoutKeys>
        <Pagination
          page={2}
          pageCount={5}
          pageSize={25}
          totalItems={120}
          pageSizeOptions={[25, 50]}
          onPageChange={vi.fn()}
          onPageSizeChange={vi.fn()}
        />
      </HostWithoutKeys>
    );

    expect(screen.getByLabelText("Previous page")).toBeTruthy();
    expect(screen.getByLabelText("Next page")).toBeTruthy();
    expect(screen.getByText(/Showing 26-50 of 120/)).toBeTruthy();
  });

  it("Spinner announces itself in English", () => {
    render(
      <HostWithoutKeys>
        <Spinner />
      </HostWithoutKeys>
    );
    expect(screen.getByText("Loading")).toBeTruthy();
  });

  it("PasswordField labels its reveal control in English", () => {
    render(
      <HostWithoutKeys>
        <PasswordField id="pw" value="secret" onChange={vi.fn()} />
      </HostWithoutKeys>
    );
    expect(screen.getByLabelText("Show password")).toBeTruthy();
  });
});
