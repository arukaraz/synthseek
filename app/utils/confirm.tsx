"use client";

import { createRoot } from "react-dom/client";
import { ConfirmationModal, ConfirmationVariant } from "@components/ui/ConfirmationModal";

export interface ConfirmOptions {
  title: string;
  message: string;
  variant?: ConfirmationVariant;
  confirmText?: string;
  cancelText?: string;
}

export function confirm(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const root = createRoot(container);

    const cleanup = () => {
      root.unmount();
      document.body.removeChild(container);
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
