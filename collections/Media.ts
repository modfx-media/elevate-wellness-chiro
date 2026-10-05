import type { CollectionConfig } from "payload";
import path from "path";
import { fileURLToPath } from "url";
import { anyone, authenticated } from "./access";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: "alt",
      type: "text",
    },
  ],
  upload: {
    staticDir: path.resolve(dirname, "../public/media"),
    adminThumbnail: "thumbnail",
    focalPoint: true,
    imageSizes: [
      { name: "thumbnail", width: 300 },
      { name: "og", width: 1200, height: 630, crop: "center" },
    ],
  },
};
