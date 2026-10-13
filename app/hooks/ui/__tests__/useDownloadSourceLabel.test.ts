import { renderHook } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { useDownloadSourceLabel } from "../useDownloadSourceLabel";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

describe("useDownloadSourceLabel", () => {
  it("names a known source the way the settings do, and an unknown one by its key", () => {
    const { result } = renderHook(() => useDownloadSourceLabel());

    expect(result.current("torrent")).toBe("Torrent");
    expect(result.current("usenet")).toBe("Usenet");
    expect(result.current("carrier-pigeon")).toBe("carrier-pigeon");
  });
});
