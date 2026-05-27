"use client";

import { createRoot } from "react-dom/client";
import { ConfirmationModal } from "@components/ui/ConfirmationModal";
import type { ConfirmOptions } from "./types";

export function confirm(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const root = createRoot(container);

    const cleanup = () => {
      root.unmount();
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };

    const handleConfirm = () => {
      cleanup();
      resolve(true);
    };

    const handleClose = () => {
      cleanup();
      resolve(false);
    };
    root.render(
      <ConfirmationModal
        isOpen={true}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={options.title}
        message={options.message}
        variant={options.variant || "danger"}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
      />
    );
  });
}
