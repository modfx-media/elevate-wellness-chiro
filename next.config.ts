import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";
import redirectsNeeded from "./seo-audit/redirects-needed.json";

const nextConfig: NextConfig = {
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  images: {
    qualities: [70, 75, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
  },
  serverExternalPackages: [
    "pg",
    "@payloadcms/db-vercel-postgres",
    "@neondatabase/serverless",
    "@vercel/postgres",
  ],
  async redirects() {
    return redirectsNeeded.redirects.map(
      (redirect: { oldPath: string; newPath: string }) => ({
        source: redirect.oldPath,
        destination: redirect.newPath,
        permanent: true,
      }),
    );
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
