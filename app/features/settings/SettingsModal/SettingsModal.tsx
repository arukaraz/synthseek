"use client";

import { Dialog, DialogContent, DialogTitle } from "@components/ui/Dialog";

import { useSettingsModal } from "@modules/providers/SettingsModalProvider";
import { SettingsLayout } from "./SettingsLayout";
import { modalContent } from "./styles";

/**
 * Thin wrapper that turns the SettingsLayout into a modal. The layout itself
 * is a pure component so we can drop this wrapper and render SettingsLayout
 * directly inside a future /settings route without refactoring.
 */
export function SettingsModal() {
  const { isOpen, section, close, setSection } = useSettingsModal();

  return (
    <Dialog open={isOpen} onOpenChange={(next) => (next ? null : close())}>
      <DialogContent className={modalContent()}>
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <SettingsLayout section={section} onSectionChange={setSection} />
      </DialogContent>
    </Dialog>
  );
}
