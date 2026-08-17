import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { Download } from "lucide-react";

import { BulkActionBar } from "../BulkActionBar";
import { ConfirmationModal } from "../ConfirmationModal";
import { PasswordField } from "../PasswordField";
import { SegmentTabs } from "../SegmentTabs";
import { TrackStatusIndicator } from "../TrackStatusIndicator";

const MARKER = "ds-passthrough-marker";

describe("className passthrough", () => {
  it("BulkActionBar forwards className to its root", () => {
    const { container } = render(
      <BulkActionBar
        count={1}
        countLabel="1 selected"
        actions={[{ icon: Download, label: "Download", onClick: vi.fn() }]}
        clearLabel="Clear"
        onClear={vi.fn()}
        className={MARKER}
      />
    );
    expect(container.querySelector(`.${MARKER}`)).not.toBeNull();
  });

  it("SegmentTabs forwards className to its root", () => {
    const { container } = render(
      <SegmentTabs
        items={[{ value: "a", label: "A" }]}
        value="a"
        onValueChange={vi.fn()}
        layoutId="passthrough"
        ariaLabel="Tabs"
        className={MARKER}
      />
    );
    expect(container.querySelector(`.${MARKER}`)).not.toBeNull();
  });

  it("TrackStatusIndicator forwards className to its root", () => {
    const { container } = render(<TrackStatusIndicator status="complete" className={MARKER} />);
    expect(container.querySelector(`.${MARKER}`)).not.toBeNull();
  });

  it("PasswordField forwards className to its root", () => {
    const { container } = render(<PasswordField id="pw" value="" onChange={vi.fn()} className={MARKER} />);
    expect(container.querySelector(`.${MARKER}`)).not.toBeNull();
  });

  it("ConfirmationModal forwards className to its content", () => {
    render(
      <ConfirmationModal
        isOpen
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Title"
        message="Message"
        className={MARKER}
      />
    );
    expect(document.querySelector(`.${MARKER}`)).not.toBeNull();
  });
});
