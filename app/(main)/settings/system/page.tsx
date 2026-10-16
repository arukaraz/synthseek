import { redirect } from "next/navigation";

export default function SystemIndex() {
  redirect("/settings/system/jobs");
}
