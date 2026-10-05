"use client";

import { RefreshRouteOnSave as PayloadLivePreview } from "@payloadcms/live-preview-react";
import { useRouter } from "next/navigation";
import { getServerURL } from "@/lib/cms/server-url";

export function LivePreviewListener() {
  const router = useRouter();
  return <PayloadLivePreview refresh={router.refresh} serverURL={getServerURL()} />;
}
