"use client";

import { toast } from "sonner";

import { trpc } from "@utils/trpc";

export function usePlexUnlink() {
  const utils = trpc.useUtils();

  return trpc.auth.unlinkPlex.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      toast.success("Plex account disconnected");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to disconnect Plex");
    },
  });
}
