"use client";

import { RefreshRouteOnSave as PayloadLivePreview } from "@payloadcms/live-preview-react";
import { useRouter } from "next/navigation";

export function LivePreviewListener({ serverURL }: { serverURL: string }) {
  const router = useRouter();
  return <PayloadLivePreview refresh={router.refresh} serverURL={serverURL} />;
}
