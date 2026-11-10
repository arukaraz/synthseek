import { redirect } from "next/navigation";

export default function ConnectionsIndex() {
  redirect("/settings/connections/services");
}
