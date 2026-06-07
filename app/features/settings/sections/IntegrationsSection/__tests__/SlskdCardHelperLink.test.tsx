import { render, screen } from "@testing-library/react";
import Link from "next/link";
import { Trans } from "react-i18next";
import { beforeAll, describe, expect, it } from "vitest";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";
import esSettings from "@modules/i18n/messages/es/settings.json";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
  i18n.addResourceBundle("es", "settings", esSettings, true, true);
});

const renderHelper = (lng: "en" | "es") => {
  const t = i18n.getFixedT(lng, "settings");
  return render(
    <Trans
      t={t}
      i18nKey="slskd.bannedUploaders.helper"
      components={{
        threshold: <Link href="/settings/engine#ban-threshold" className="text-primary-400" />,
      }}
    />
  );
};

describe("SlskdCard banned-uploaders helper link", () => {
  it("renders a clickable anchor with visible text and the threshold href (EN)", () => {
    renderHelper("en");

    const anchor = screen.getByRole("link", { name: "Configure threshold" });
    expect(anchor).toHaveAttribute("href", "/settings/engine#ban-threshold");
    expect(anchor.textContent).not.toBe("");
  });

  it("renders a clickable anchor with visible text and the threshold href (ES)", () => {
    renderHelper("es");

    const anchor = screen.getByRole("link", { name: "Configurar umbral" });
    expect(anchor).toHaveAttribute("href", "/settings/engine#ban-threshold");
    expect(anchor.textContent).not.toBe("");
  });
});
