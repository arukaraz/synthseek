"use client";

import { useSourcePickerRequest } from "@hooks/ui/player";

import { SourcePickerDialog } from "./SourcePickerDialog";

export function PlaybackSourcePicker() {
  const request = useSourcePickerRequest();
  if (request === null) return null;
  return <SourcePickerDialog key={request.id} request={request} />;
}
