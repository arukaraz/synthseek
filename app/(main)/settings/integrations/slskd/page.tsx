import { redirect } from "next/navigation";

export default function SlskdIntegrationPage() {
  redirect("/settings/download-sources?source=slskd");
}
