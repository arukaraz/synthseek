import { redirect } from "next/navigation";

export default function DownloadIndex() {
  redirect("/settings/download/sources");
}
