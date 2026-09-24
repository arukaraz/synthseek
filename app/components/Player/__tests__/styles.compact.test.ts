import { describe, expect, it } from "vitest";

import { barExtras, barIdentity, barTextColumn, barTransport, headerPlayer } from "../styles";

describe("compact player sizing", () => {
  it("does not make the compact shell an inline-size container, which would pin its width to zero", () => {
    expect(headerPlayer()).not.toContain("@container");
  });

  it("sizes the compact shell from its content, capped at the compact width", () => {
    expect(headerPlayer()).toContain("w-max");
    expect(headerPlayer()).toContain("max-w-[min(var(--width-player-compact),42vw)]");
  });

  it("lets the identity block grow only in the dock, so the compact controls sit beside the track name", () => {
    expect(barIdentity({ placement: "dock" })).toContain("flex-1");
    expect(barIdentity({ placement: "header" })).not.toContain("flex-1");
  });

  it("never hides the track name or the transport, now that nothing folds them away", () => {
    expect(barTextColumn()).not.toContain("hidden");
    expect(barTransport()).not.toContain("hidden");
  });

  it("puts the extras, and with them the more menu, after the transport on a narrow bar", () => {
    expect(barTransport()).toContain("order-3");
    expect(barExtras()).toContain("order-4");
    expect(barExtras()).toContain("@player:order-none");
  });
});
