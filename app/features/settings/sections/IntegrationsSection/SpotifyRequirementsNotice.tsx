"use client";

import { AlertTriangle } from "lucide-react";

import { noticeBody, noticeIcon, noticeLink, noticeList, noticeRoot, noticeTitle } from "./styles";

export function SpotifyRequirementsNotice() {
  return (
    <div className={noticeRoot()}>
      <AlertTriangle className={noticeIcon()} />
      <div className={noticeBody()}>
        <span className={noticeTitle()}>Spotify Development Mode requirements</span>
        <ul className={noticeList()}>
          <li>
            • The Spotify account that <strong>owns the app</strong> in the{" "}
            <a
              href="https://developer.spotify.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className={noticeLink()}
            >
              Developer Dashboard
            </a>{" "}
            must have an active Premium subscription.
          </li>
          <li>
            • Every Synthseek user who wants to connect must be added to the app&apos;s{" "}
            <strong>Settings → User Management</strong> list (using their Spotify email). Up to 25 users
            in Dev Mode.
          </li>
          <li>
            • Connecting users do <strong>not</strong> need Premium themselves, only the app owner does.
          </li>
        </ul>
      </div>
    </div>
  );
}
