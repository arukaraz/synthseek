import { redirect } from "next/navigation";

export default function PlexIntegrationPage() {
  redirect("/settings/library/sources?server=plex");
}
