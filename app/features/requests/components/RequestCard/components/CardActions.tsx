"use client";

import { Button } from "@components/ui/Button";
import { ContentType } from "@api/__generated__/types";
import { titleCase } from "@utils/formatters";
import { actionIconButton } from "@theme/utilities/styles";
import { actionButtonLabel } from "../../styles";
import { scale } from "@utils/animations";
import { motion } from "framer-motion";
import { RotateCcw, Square, Trash2 } from "lucide-react";

type ActionVariant = "icon-only" | "with-label";

interface CardActionsProps {
  canRetry: boolean;
  canCancel?: boolean;
  onRetry: () => void;
  onCancel?: () => void;
  onRemove: () => void;
  variant?: ActionVariant;
  itemType?: ContentType;
}

export function CardActions({
  canRetry,
  canCancel,
  onRetry,
  onCancel,
  onRemove,
  variant = "icon-only",
  itemType = ContentType.enum.track,
}: CardActionsProps) {
  if (variant === "icon-only") {
    return (
      <IconOnlyActions
        canRetry={canRetry}
        canCancel={canCancel}
        onRetry={onRetry}
        onCancel={onCancel}
        onRemove={onRemove}
      />
    );
  }

  return (
    <LabeledActions
      canRetry={canRetry}
      canCancel={canCancel}
      onRetry={onRetry}
      onCancel={onCancel}
      onRemove={onRemove}
      itemType={itemType}
    />
  );
}

function IconOnlyActions({
  canRetry,
  canCancel,
  onRetry,
  onCancel,
  onRemove,
}: Pick<CardActionsProps, "canRetry" | "canCancel" | "onRetry" | "onCancel" | "onRemove">) {
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

      {canCancel && onCancel && (
        <motion.button
          onClick={onCancel}
          className={actionIconButton({ variant: "warning", size: "sm", border: "colored" })}
          variants={scale}
          whileHover="hover"
          whileTap="tap"
          title="Cancel download"
          data-cy="cancel-btn"
        >
          <Square className="h-3.5 w-3.5" />
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
  canCancel,
  onRetry,
  onCancel,
  onRemove,
  itemType = ContentType.enum.track,
}: Pick<CardActionsProps, "canRetry" | "canCancel" | "onRetry" | "onCancel" | "onRemove" | "itemType">) {
  const retryLabel = `Retry ${titleCase(itemType)}`;
  const cancelLabel = `Cancel ${titleCase(itemType)}`;

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

      {canCancel && onCancel && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1"
        >
          <Button
            onClick={onCancel}
            variant="outline"
            size="sm"
            className={actionButtonLabel({ color: "warning" })}
            data-cy={`${itemType}-cancel-btn`}
          >
            <Square className="mr-1.5 h-3.5 w-3.5" />
            {cancelLabel}
          </Button>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
        className={canRetry || canCancel ? "" : "flex-1"}
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
