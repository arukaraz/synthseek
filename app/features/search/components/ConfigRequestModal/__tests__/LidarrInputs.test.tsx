import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import type { LidarrArtistSelection, LidarrProfiles, LidarrSelection } from "../types";

let profilesState: {
  data: LidarrProfiles | undefined;
  isLoading: boolean;
  isError: boolean;
};
let tagsState: { data: Array<{ id: number; label: string }> | undefined };

vi.mock("@hooks/api", () => ({
  useLidarrProfiles: () => profilesState,
  useLidarrTags: () => tagsState,
}));

vi.mock("framer-motion", () => ({
  motion: {
    button: ({ children, ...props }: React.ComponentProps<"button">) => <button {...props}>{children}</button>,
    div: ({ children, ...props }: React.ComponentProps<"div">) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useReducedMotion: () => true,
}));

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { LidarrInputs } from "../LidarrInputs";
import { DEFAULT_ARTIST_MONITOR_SCOPE, DEFAULT_MONITOR_SCOPE } from "../constants";

const PROFILES: LidarrProfiles = {
  rootFolders: [{ path: "/music", freeSpace: 50 * 1024 ** 3, accessible: true, id: 1 }],
  qualityProfiles: [{ id: 1, name: "Lossless" }],
  metadataProfiles: [{ id: 2, name: "Standard" }],
  defaults: { rootFolderPath: "/music", qualityProfileId: 1, metadataProfileId: 2 },
};

const EMPTY_ALBUM_SELECTION: LidarrSelection = {
  rootFolderPath: undefined,
  qualityProfileId: undefined,
  metadataProfileId: undefined,
  monitor: DEFAULT_MONITOR_SCOPE,
  tags: [],
};

const EMPTY_ARTIST_SELECTION: LidarrArtistSelection = {
  rootFolderPath: undefined,
  qualityProfileId: undefined,
  metadataProfileId: undefined,
  monitor: DEFAULT_ARTIST_MONITOR_SCOPE,
  tags: [],
};

describe("LidarrInputs", () => {
  beforeEach(() => {
    profilesState = { data: PROFILES, isLoading: false, isError: false };
    tagsState = { data: [{ id: 1, label: "hi-fi" }] };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows the loading state while profiles resolve", () => {
    profilesState = { data: undefined, isLoading: true, isError: false };

    render(<LidarrInputs monitorMode="album" value={EMPTY_ALBUM_SELECTION} onChange={vi.fn()} />);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("shows the error state when the profiles query fails", () => {
    profilesState = { data: undefined, isLoading: false, isError: true };

    render(<LidarrInputs monitorMode="album" value={EMPTY_ALBUM_SELECTION} onChange={vi.fn()} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("renders the album profile selectors once data is available", () => {
    render(<LidarrInputs monitorMode="album" value={EMPTY_ALBUM_SELECTION} onChange={vi.fn()} />);

    expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
  });

  it("auto-fills the selection with defaults when incomplete", () => {
    const onChange = vi.fn();

    render(<LidarrInputs monitorMode="album" value={EMPTY_ALBUM_SELECTION} onChange={onChange} />);

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ rootFolderPath: "/music", qualityProfileId: 1, metadataProfileId: 2 })
    );
  });

  it("does not auto-fill when the selection is already complete", () => {
    const onChange = vi.fn();
    const complete: LidarrSelection = {
      rootFolderPath: "/music",
      qualityProfileId: 1,
      metadataProfileId: 2,
      monitor: DEFAULT_MONITOR_SCOPE,
      tags: [],
    };

    render(<LidarrInputs monitorMode="album" value={complete} onChange={onChange} />);

    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders the artist monitor variant", () => {
    render(<LidarrInputs monitorMode="artist" value={EMPTY_ARTIST_SELECTION} onChange={vi.fn()} />);

    expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
  });

  it("forwards a tag change up through the album onChange", async () => {
    const onChange = vi.fn();
    const complete: LidarrSelection = {
      rootFolderPath: "/music",
      qualityProfileId: 1,
      metadataProfileId: 2,
      monitor: DEFAULT_MONITOR_SCOPE,
      tags: [],
    };
    const user = userEvent.setup();

    render(<LidarrInputs monitorMode="album" value={complete} onChange={onChange} />);

    const tagInput = screen.getByLabelText(/tags/i);
    await user.type(tagInput, "rock");
    await user.keyboard("{Enter}");

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ tags: ["rock"] }));
  });

  it("forwards a root folder selection up through the onChange", async () => {
    const onChange = vi.fn();
    const complete: LidarrSelection = {
      rootFolderPath: undefined,
      qualityProfileId: 1,
      metadataProfileId: 2,
      monitor: DEFAULT_MONITOR_SCOPE,
      tags: [],
    };
    const user = userEvent.setup();

    render(<LidarrInputs monitorMode="album" value={complete} onChange={onChange} />);

    const rootTrigger = screen.getByRole("button", { name: /root folder/i });
    await user.click(rootTrigger);

    const items = await screen.findAllByRole("menuitemradio");
    await user.click(items[0]);

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ rootFolderPath: "/music" }));
  });

  it("forwards quality and metadata selections up through the onChange", async () => {
    const onChange = vi.fn();
    const complete: LidarrSelection = {
      rootFolderPath: "/music",
      qualityProfileId: undefined,
      metadataProfileId: 2,
      monitor: DEFAULT_MONITOR_SCOPE,
      tags: [],
    };
    const user = userEvent.setup();

    render(<LidarrInputs monitorMode="album" value={complete} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: /quality profile/i }));
    const qualityItems = await screen.findAllByRole("menuitemradio");
    await user.click(qualityItems[0]);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ qualityProfileId: 1 }));

    onChange.mockClear();

    await user.click(screen.getByRole("button", { name: /metadata profile/i }));
    const metadataItems = await screen.findAllByRole("menuitemradio");
    await user.click(metadataItems[0]);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ metadataProfileId: 2 }));
  });

  it("forwards an album monitor scope change up through the onChange", async () => {
    const onChange = vi.fn();
    const complete: LidarrSelection = {
      rootFolderPath: "/music",
      qualityProfileId: 1,
      metadataProfileId: 2,
      monitor: DEFAULT_MONITOR_SCOPE,
      tags: [],
    };
    const user = userEvent.setup();

    render(<LidarrInputs monitorMode="album" value={complete} onChange={onChange} />);

    await user.click(screen.getByText(/entire artist/i));

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ monitor: "all" }));
  });

  it("forwards an artist monitor scope change up through the onChange", async () => {
    const onChange = vi.fn();
    const complete: LidarrArtistSelection = {
      rootFolderPath: "/music",
      qualityProfileId: 1,
      metadataProfileId: 2,
      monitor: DEFAULT_ARTIST_MONITOR_SCOPE,
      tags: [],
    };
    const user = userEvent.setup();

    render(<LidarrInputs monitorMode="artist" value={complete} onChange={onChange} />);

    const radios = screen.getAllByRole("radio");
    const future = radios.find((radio) => radio.textContent?.toLowerCase().includes("future"));
    await user.click(future ?? radios[1]);

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ monitor: expect.any(String) }));
  });
});
