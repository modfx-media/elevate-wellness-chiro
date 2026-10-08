import type { CollectionConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { authenticated, authenticatedOrPublished } from "./access";
import { draftVersions, migratedContentFields, previewAdmin, routingFields } from "./contentFields";

export const Posts: CollectionConfig = {
  slug: "posts",
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: previewAdmin,
  fields: [
    ...routingFields,
    {
      type: "tabs",
      tabs: [
        {
          label: "Content",
          fields: [
            {
              name: "content",
              type: "richText",
              label: "Article",
              editor: lexicalEditor(),
              admin: {
                description:
                  "Article body. Use the image button to upload inline images. The featured image is the SEO image.",
              },
            },
            ...migratedContentFields,
          ],
        },
      ],
    },
  ],
  versions: draftVersions,
};
