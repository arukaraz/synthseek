import { redirect } from "next/navigation";

export default function PlexIntegrationPage() {
  redirect("/settings/media?server=plex");
}
