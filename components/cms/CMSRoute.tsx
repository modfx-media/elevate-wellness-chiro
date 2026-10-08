import { draftMode } from "next/headers";
import type { ReactNode } from "react";
import { withCMS } from "@/lib/cms/safe";
import { queryRoutedContentByPath } from "@/lib/cms/query";
import { getServerURL } from "@/lib/cms/server-url";
import { LivePreviewListener } from "@/components/cms/LivePreviewListener";
import { RenderRoutedContent } from "@/components/cms/RenderRoutedContent";

export async function CMSRoute({
  path,
  children,
}: {
  path: string;
  children: ReactNode;
}) {
  const [routed, draft] = await Promise.all([
    withCMS(() => queryRoutedContentByPath(path), null),
    draftMode(),
  ]);

  if (!routed) return children;

  return (
    <>
      {draft.isEnabled ? <LivePreviewListener serverURL={getServerURL()} /> : null}
      <RenderRoutedContent doc={routed.doc} collection={routed.collection} />
    </>
  );
}
