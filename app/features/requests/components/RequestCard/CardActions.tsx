"use client";

import { Button } from "@components/ui/Button";
import { ContentType } from "@api/__generated__/types";
import { actionIconButton } from "@theme/utilities/styles";
import { actionButtonLabel } from "../styles";
import { scale } from "@utils/animations";
import { motion } from "framer-motion";
import { RotateCcw, Trash2 } from "lucide-react";

type ActionVariant = "icon-only" | "with-label";

interface CardActionsProps {
  canRetry: boolean;
  onRetry: () => void;
  onRemove: () => void;
  variant?: ActionVariant;
  itemType?: ContentType;
}

export function CardActions({
  canRetry,
  onRetry,
  onRemove,
  variant = "icon-only",
  itemType = ContentType.enum.track,
}: CardActionsProps) {
  if (variant === "icon-only") {
    return <IconOnlyActions canRetry={canRetry} onRetry={onRetry} onRemove={onRemove} />;
  }

  return <LabeledActions canRetry={canRetry} onRetry={onRetry} onRemove={onRemove} itemType={itemType} />;
}

function IconOnlyActions({ canRetry, onRetry, onRemove }: Pick<CardActionsProps, "canRetry" | "onRetry" | "onRemove">) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      {canRetry && (
        <motion.button
          onClick={onRetry}
          className={actionIconButton({ variant: "success", size: "sm", border: "colored" })}
          variants={scale}
          whileHover="hover"
          whileTap="tap"
          title="Retry download"
          data-cy="retry-btn"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </motion.button>
      )}

      <motion.button
        onClick={onRemove}
        className={actionIconButton({ variant: "danger", size: "sm", border: "transparent" })}
        variants={scale}
        whileHover="hover"
        whileTap="tap"
        title="Remove request"
        data-cy="delete-btn"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </motion.button>
    </div>
  );
}

function LabeledActions({
  canRetry,
  onRetry,
  onRemove,
  itemType,
}: Pick<CardActionsProps, "canRetry" | "onRetry" | "onRemove" | "itemType">) {
  const retryLabel = itemType === ContentType.enum.album ? "Retry Album" : "Retry";

  return (
    <div className="flex items-center gap-2 pt-2">
      {canRetry && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1"
        >
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className={actionButtonLabel({ color: "primary" })}
            data-cy={`${itemType}-retry-btn`}
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            {retryLabel}
          </Button>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
        className={canRetry ? "" : "flex-1"}
      >
        <Button
          onClick={onRemove}
          variant="outline"
          size="sm"
          className={actionButtonLabel({ color: "danger" })}
          data-cy={`${itemType}-delete-btn`}
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          Remove
        </Button>
      </motion.div>
    </div>
  );
}
