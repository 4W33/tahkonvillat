"use client";

import { RefreshRouteOnSave } from "@payloadcms/live-preview-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** Payloadin Live Preview -paneelissa (iframe) sivu päivittyy, kun admin tallentaa. */
export function LivePreviewRefresh() {
  const router = useRouter();
  const [origin, setOrigin] = useState<string | null>(null);

  useEffect(() => {
    if (window.self !== window.top) setOrigin(window.location.origin);
  }, []);

  if (!origin) return null;
  return <RefreshRouteOnSave refresh={() => router.refresh()} serverURL={origin} />;
}
