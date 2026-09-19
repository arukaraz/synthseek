import { describe, expect, it } from "vitest";

import { barIdentity, barTextColumn, barTransport, headerPlayer } from "../styles";

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

  it("folds with a plain hidden in the header, where no container query can resolve", () => {
    expect(barTextColumn({ folded: true, placement: "header" })).toContain("hidden");
    expect(barTextColumn({ folded: true, placement: "header" })).not.toContain("@max-player");
    expect(barTransport({ folded: true, placement: "header" })).toContain("hidden");
    expect(barTransport({ folded: true, placement: "header" })).not.toContain("@max-player");
  });

  it("keeps the dock folding on its container query, since the dock is still a container", () => {
    expect(barTextColumn({ folded: true, placement: "dock" })).toContain("@max-player:hidden");
    expect(barTransport({ folded: true, placement: "dock" })).toContain("@max-player:hidden");
  });

  it("leaves both unfolded states untouched", () => {
    expect(barTextColumn({ folded: false, placement: "header" })).not.toContain("hidden");
    expect(barTransport({ folded: false, placement: "dock" })).not.toContain("hidden");
  });
});
