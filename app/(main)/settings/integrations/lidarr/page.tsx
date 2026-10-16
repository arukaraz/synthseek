import { redirect } from "next/navigation";

export default function LidarrIntegrationPage() {
  redirect("/settings/download-sources?source=lidarr");
}
