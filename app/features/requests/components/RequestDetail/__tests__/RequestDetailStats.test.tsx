import { ContentType, RequestStatus, Role, type RequestWithTracks } from "@api/__generated__/types";
import { render, screen } from "@test/test-utils";
import { describe, expect, it } from "vitest";

import { makeRequestsTrack as makeTrack } from "../../../__tests__/factories";
import { RequestDetailStats } from "../RequestDetailStats";

function makeRequest(overrides: Partial<RequestWithTracks> = {}): RequestWithTracks {
  return {
    id: "req-1",
    external_id: "ext-req-1",
    name: "A Playlist",
    artist: "Various Artists",
    album_art: null,
    user_id: "user-1",
    release_date: "2026-01-01",
    total_tracks: 10,
    completed_tracks: 7,
    status: RequestStatus.enum.processing,
    genres: null,
    upc: null,
    delegated_to: null,
    source_provider: null,
    source_id: null,
    auto_imported: false,
    created_at: new Date(),
    updated_at: new Date(),
    contentType: ContentType.enum.playlist,
    plex_playlist_id: null,
    duplicateCount: 0,
    tracks: [],
    requestedBy: {
      id: "user-1",
      email: "owner@example.com",
      username: "owner",
      avatar_url: null,
      role: Role.enum.member,
      language: "en",
      plex_username: null,
      plexLinked: false,
      hasPassword: true,
      created_at: new Date(),
    },
    ...overrides,
  };
}

describe("RequestDetailStats duplicates card", () => {
  it("renders the Duplicates card when duplicateCount is greater than zero", () => {
    render(<RequestDetailStats request={makeRequest({ duplicateCount: 3 })} />);

    expect(screen.getByText("Duplicates")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("ignored")).toBeInTheDocument();
  });

  it("hides the Duplicates card when duplicateCount is zero", () => {
    render(<RequestDetailStats request={makeRequest({ duplicateCount: 0 })} />);

    expect(screen.queryByText("Duplicates")).not.toBeInTheDocument();
    expect(screen.queryByText("ignored")).not.toBeInTheDocument();
  });
});

describe("RequestDetailStats status branches", () => {
  it("renders nothing for a delegated request", () => {
    const { container } = render(
      <RequestDetailStats request={makeRequest({ status: RequestStatus.enum.delegated })} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("counts complete, failed, and active tracks from the request", () => {
    render(
      <RequestDetailStats
        request={makeRequest({
          tracks: [
            makeTrack({ id: "c1", status: RequestStatus.enum.complete }),
            makeTrack({ id: "f1", status: RequestStatus.enum.failed }),
            makeTrack({ id: "f2", status: RequestStatus.enum.cancelled }),
            makeTrack({ id: "a1", status: RequestStatus.enum.downloading }),
          ],
        })}
      />
    );

    expect(screen.getByText("Complete").parentElement).toHaveTextContent("1");
    expect(screen.getByText("Failed").parentElement).toHaveTextContent("2");
    expect(screen.getByText("Active").parentElement).toHaveTextContent("1");
  });
});
