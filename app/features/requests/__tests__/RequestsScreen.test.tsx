import { render, screen } from "@test/test-utils";
import { describe, expect, it, vi } from "vitest";

import { RequestsScreen } from "../RequestsScreen";

vi.mock("../components/SpotifyCallbackToast", () => ({
  SpotifyCallbackToast: () => <div>spotify toast</div>,
}));

vi.mock("../components/RequestsActivityDivider", () => ({
  RequestsActivityDivider: ({ children }: { children: React.ReactNode }) => <div>activity divider{children}</div>,
}));

vi.mock("../components/Toolbar/Toolbar", () => ({
  Toolbar: () => <div>toolbar</div>,
}));

vi.mock("../components/GroupsViewMode", () => ({
  GroupsViewMode: () => <div>groups view</div>,
}));

vi.mock("../components/StorageFailureNotice", () => ({
  StorageFailureNotice: () => <div>storage failure notice</div>,
}));

describe("RequestsScreen", () => {
  it("composes the toast, activity divider, toolbar and groups view", () => {
    render(<RequestsScreen />);

    expect(screen.getByText("spotify toast")).toBeInTheDocument();
    expect(screen.getByText(/activity divider/)).toBeInTheDocument();
    expect(screen.getByText("toolbar")).toBeInTheDocument();
    expect(screen.getByText("groups view")).toBeInTheDocument();
    expect(screen.getByText("storage failure notice")).toBeInTheDocument();
  });

  it("keeps the storage failure notice outside the scrolling group list", () => {
    render(<RequestsScreen />);

    const notice = screen.getByText("storage failure notice");
    const groups = screen.getByText("groups view");
    expect(groups.closest(".overflow-auto")?.contains(notice)).toBe(false);
  });

  it("renders the toolbar inside the activity divider", () => {
    render(<RequestsScreen />);

    const divider = screen.getByText(/activity divider/);
    expect(divider).toHaveTextContent("toolbar");
  });
});
