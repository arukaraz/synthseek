import { trpc } from "@utils/trpc";

export interface ExportCollectionArgs {
  id: string;
  type: "playlist" | "album";
}

export function useExportCollection() {
  const utils = trpc.useUtils();
  return {
    exportCollection: (args: ExportCollectionArgs) => utils.portability.exportCollection.fetch(args),
  };
}
