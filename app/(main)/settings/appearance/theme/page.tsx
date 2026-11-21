import { redirect } from "next/navigation";

export default function AppearanceThemeRedirect() {
  redirect("/settings/customization/theme");
}
