import type { NextConfig } from "next";
import redirectsNeeded from "./seo-audit/redirects-needed.json";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.elevatewellnesschiro.com",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
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

export default nextConfig;
