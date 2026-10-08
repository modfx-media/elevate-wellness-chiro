import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelPostgresAdapter } from "@payloadcms/db-vercel-postgres";
import { seoPlugin } from "@payloadcms/plugin-seo";
import { searchPlugin } from "@payloadcms/plugin-search";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import sharp from "sharp";
import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Pages } from "./collections/Pages";
import { Posts } from "./collections/Posts";
import { Header } from "./globals/Header";
import { Footer } from "./globals/Footer";
import { SiteSettings } from "./globals/SiteSettings";
import { ensurePostContentColumns } from "./lib/cms/ensure-post-content";
import { getCorsOrigins, getServerURL } from "./lib/cms/server-url";
import { toPublicPath } from "./lib/cms/paths";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const disablePush = Boolean(process.env.VERCEL) || process.env.CMS_IMPORT_APPLY === "1";
const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

export default buildConfig({
  serverURL: getServerURL(),
  secret: process.env.PAYLOAD_SECRET || "",
  cors: getCorsOrigins(),
  csrf: getCorsOrigins(),
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    livePreview: {
      breakpoints: [
        { label: "Mobile", name: "mobile", width: 375, height: 667 },
        { label: "Tablet", name: "tablet", width: 768, height: 1024 },
        { label: "Desktop", name: "desktop", width: 1440, height: 900 },
      ],
    },
  },
  collections: [Users, Media, Pages, Posts],
  globals: [Header, Footer, SiteSettings],
  editor: lexicalEditor(),
  onInit: async (payload) => {
    await ensurePostContentColumns(payload);
  },
  sharp,
  db: vercelPostgresAdapter({
    forceUseVercelPostgres: true,
    push: disablePush ? false : undefined,
    pool: {
      connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL || "",
    },
  }),
  plugins: [
    seoPlugin({
      collections: ["pages", "posts"],
      uploadsCollection: "media",
      tabbedUI: true,
      generateTitle: ({ doc }) => (typeof doc?.title === "string" ? doc.title : "Elevate Wellness Chiropractic"),
      generateURL: ({ doc }) => {
        const pathValue = typeof doc?.path === "string" ? doc.path : undefined;
        if (!pathValue) return getServerURL();
        return `${getServerURL()}${toPublicPath(pathValue)}`;
      },
    }),
    searchPlugin({
      collections: ["pages", "posts"],
    }),
    vercelBlobStorage({
      enabled: Boolean(blobToken),
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN,
      clientUploads: true,
    }),
  ],
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});
