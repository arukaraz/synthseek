import { redirect } from "next/navigation";

export default function LibraryIndex() {
  redirect("/settings/library/paths");
}
