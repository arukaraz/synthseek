import { redirect } from "next/navigation";

export default function IntegrationsIndex() {
  redirect("/settings/integrations/download-sources");
}
