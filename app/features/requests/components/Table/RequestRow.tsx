"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/DropdownMenu";
import { IconButton } from "@components/ui/IconButton";
import { ImagePlaceholder } from "@components/ui/ImagePlaceholder";
import { useCancelTrack, useRetryTrack } from "@hooks/api";
import { RequestStatus } from "@api/__generated__/types";
import { useCurrentUser } from "@modules/providers/AuthProvider";
import { cn } from "@utils/cn";
import { confirm } from "@utils/confirm";
import { formatRelativeTime, titleCase } from "@utils/formatters";
import { isOwnerOrAdminFE } from "@utils/authorization";
import { REQUEST_STATUS_CONFIG } from "@utils/statusConfig";
import { mobileActionsButton } from "../styles";
import { FlatTrackRow } from "../../types";
import { motion } from "framer-motion";
import { MoreVertical, Music, RefreshCw, Trash2 } from "lucide-react";
import Image from "next/image";

interface RequestRowProps {
  item: FlatTrackRow;
}

export function RequestRow({ item }: RequestRowProps) {
  const currentUser = useCurrentUser();
  const retryTrack = useRetryTrack();
  const cancelTrack = useCancelTrack();

  const statusConfig = REQUEST_STATUS_CONFIG[item.status];
  const canRetry = item.status === RequestStatus.enum.failed || item.status === RequestStatus.enum.cancelled;
  const canAct = isOwnerOrAdminFE({ id: item.parent.requestedBy.id }, currentUser);

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "Cancel Track",
      message: `Cancel "${item.title}" by ${item.artist}?`,
      variant: "danger",
      confirmText: "Cancel",
      cancelText: "Keep",
    });

    if (confirmed) {
      cancelTrack.mutate({ trackId: item.id });
    }
  };

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="group border-fg/5 hover:bg-fg/5 border-b transition-colors"
      data-status={item.status}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {item.parent.album_art ? (
            <Image
              src={item.parent.album_art}
              alt={item.title}
              width={40}
              height={40}
              className="rounded-md object-cover"
            />
          ) : (
            <ImagePlaceholder size="sm" icon={Music} />
          )}
          <div className="min-w-0">
            <p className="text-fg truncate text-sm font-medium">{item.title}</p>
          </div>
        </div>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className={cn("h-2 w-2 rounded-full", statusConfig.glowColor)} />
          <span className={cn("text-xs font-medium", statusConfig.color)}>{statusConfig.label}</span>
        </div>
      </td>

      <td className="px-4 py-3">
        <span className="text-fg/60 truncate text-sm">{item.parent.name}</span>
      </td>

      <td className="px-4 py-3">
        <span className="text-fg/60 truncate text-sm">{item.artist}</span>
      </td>

      <td className="px-4 py-3">
        <span className="text-fg/60 text-xs">{titleCase(item.parent.contentType)}</span>
      </td>

      <td className="px-4 py-3">
        <span className="text-fg/60 truncate text-xs">
          {currentUser?.id === item.parent.requestedBy.id ? "you" : item.parent.requestedBy.username}
        </span>
      </td>

      <td className="px-4 py-3">
        <span className="text-fg/40 text-xs">{formatRelativeTime(new Date(item.created_at))}</span>
      </td>

      <td className="px-4 py-3">
        <span className="text-fg/40 text-xs">
          {item.completed_at ? formatRelativeTime(new Date(item.completed_at)) : "-"}
        </span>
      </td>

      <td className="px-4 py-3">
        {canAct && (
          <>
            <div className="desktop-only items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              {canRetry && (
                <IconButton
                  icon={RefreshCw}
                  variant="green"
                  size="sm"
                  onClick={() => retryTrack.mutate({ trackId: item.id })}
                  aria-label="Retry download"
                  title="Retry"
                />
              )}
              <IconButton
                icon={Trash2}
                variant="red"
                size="sm"
                onClick={handleDelete}
                aria-label="Cancel track"
                title="Cancel"
              />
            </div>

            <div className="sm:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={mobileActionsButton()} aria-label="Actions menu">
                    <MoreVertical className="size-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canRetry && (
                    <DropdownMenuItem
                      onClick={() => retryTrack.mutate({ trackId: item.id })}
                      className="text-green-400 hover:text-green-300"
                    >
                      <RefreshCw className="size-4" />
                      Retry download
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleDelete} className="text-red-400 hover:text-red-300">
                    <Trash2 className="size-4" />
                    Cancel track
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        )}
      </td>
    </motion.tr>
  );
}
