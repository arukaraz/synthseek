"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/DropdownMenu";
import { primaryGradientButton } from "@theme/utilities/styles";
import { motion } from "framer-motion";
import { ChevronDown, RefreshCw, Trash2, Zap } from "lucide-react";

interface ActionsDropdownProps {
  showRetryFailed: boolean;
  isAdmin: boolean;
  onRetryAllFailed: () => void;
  onDeleteAll: () => void;
}

export function ActionsDropdown({ showRetryFailed, isAdmin, onRetryAllFailed, onDeleteAll }: ActionsDropdownProps) {
  const retryLabel = isAdmin ? "Retry all failed" : "Retry my failed requests";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          className={primaryGradientButton({ size: "sm", glow: "primary", hover: "lighten" })}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Zap className="size-3.5" />
          <span>Actions</span>
          <ChevronDown className="size-3 opacity-70" />
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        {showRetryFailed && (
          <DropdownMenuItem onClick={onRetryAllFailed}>
            <RefreshCw className="size-4 text-yellow-400" />
            <span>{retryLabel}</span>
          </DropdownMenuItem>
        )}
        {isAdmin && (
          <DropdownMenuItem onClick={onDeleteAll} className="text-red-400 hover:text-red-300 focus:text-red-300">
            <Trash2 className="size-4" />
            <span>Delete all</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
