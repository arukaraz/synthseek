"use client";

import { useEffect, useRef, useState } from "react";

import { useSignInMethods } from "@hooks/api/queries/useSignInMethods";
import { useArrivalSearch } from "@hooks/ui/useArrivalSearch";

import { signInBackdrop, signInCollage, signInScrim } from "../styles";

export function SignInBackdrop() {
  const { data } = useSignInMethods(useArrivalSearch());
  const url = data?.background?.url ?? null;
  const imageRef = useRef<HTMLImageElement>(null);
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  useEffect(() => {
    const image = imageRef.current;
    if (!url || !image?.complete) return;
    if (image.naturalWidth > 0) setLoadedUrl(url);
    else setFailedUrl(url);
  }, [url]);

  if (!url || failedUrl === url) return null;

  return (
    <div aria-hidden="true" className={signInBackdrop({ ready: loadedUrl === url })}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imageRef}
        src={url}
        alt=""
        decoding="async"
        draggable={false}
        onLoad={() => setLoadedUrl(url)}
        onError={() => setFailedUrl(url)}
        className={signInCollage()}
      />
      <div className={signInScrim()} />
    </div>
  );
}
