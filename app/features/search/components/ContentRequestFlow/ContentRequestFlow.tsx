"use client";

import { createContext, useContext } from "react";

import { ContentType } from "@api/__generated__/types";
import { useContentRequestModals } from "@hooks/ui/useContentRequestModals";
import { ConfigRequestModal } from "../ConfigRequestModal/ConfigRequestModal";
import { ContentBrowserModal } from "../ContentBrowserModal/ContentBrowserModal";
import type { ContentRequestFlowProps, FlowContextValue } from "./types";

const ContentRequestFlowContext = createContext<FlowContextValue | null>(null);

export function useContentRequestFlow(): FlowContextValue {
  const ctx = useContext(ContentRequestFlowContext);
  if (!ctx) throw new Error("useContentRequestFlow must be used within ContentRequestFlow");
  return ctx;
}

export function ContentRequestFlow({ children }: ContentRequestFlowProps) {
  const flow = useContentRequestModals();

  return (
    <ContentRequestFlowContext.Provider value={{ openForResult: flow.openForResult }}>
      {children}
      {flow.selectedResult && flow.selectedResult.type !== ContentType.enum.track && (
        <ContentBrowserModal {...flow.browserModalProps} type={flow.selectedResult.type} data={flow.selectedResult} />
      )}
      {flow.selectedContentToRequest && <ConfigRequestModal {...flow.configModalProps} onSuccess={() => {}} />}
    </ContentRequestFlowContext.Provider>
  );
}
