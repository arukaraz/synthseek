import { toast } from "sonner";

import { trpc } from "@utils/trpc";

export function useImportPlexUsers() {
  const utils = trpc.useUtils();
  return trpc.users.importPlex.useMutation({
    onSuccess: (result) => {
      utils.users.list.invalidate();
      utils.users.plexImportable.invalidate();
      const importedCount = result.imported.length;
      if (importedCount === 0) {
        toast.info("No new users imported");
        return;
      }
      const skippedNote = result.skipped > 0 ? ` (${result.skipped} skipped)` : "";
      toast.success(`Imported ${importedCount} ${importedCount === 1 ? "user" : "users"}${skippedNote}`);
    },
    onError: (error) => toast.error(error.message || "Failed to import Plex users"),
  });
}
