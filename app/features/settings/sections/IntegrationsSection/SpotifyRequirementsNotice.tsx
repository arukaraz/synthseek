"use client";

import { Notice } from "@components/ui/Notice";

import { noticeLink, noticeList } from "./styles";

export function SpotifyRequirementsNotice() {
  return (
    <Notice variant="warning" title="Spotify Development Mode requirements" collapsible defaultOpen={false}>
      <ul className={noticeList()}>
        <li>
          • The Spotify account that <strong>owns the app</strong> in the{" "}
          <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noreferrer" className={noticeLink()}>
            Developer Dashboard
          </a>{" "}
          must have an active Premium subscription.
        </li>
        <li>
          • Every Synthseek user who wants to connect must be added to the app&apos;s{" "}
          <strong>Settings → User Management</strong> list (using their Spotify email).
        </li>
        <li>
          • Connecting users do <strong>not</strong> need Premium themselves, only the app owner does.
        </li>
      </ul>
    </Notice>
  );
}
