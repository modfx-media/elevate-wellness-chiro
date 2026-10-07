import type { CollectionConfig } from "payload";
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
          fields: migratedContentFields,
        },
      ],
    },
  ],
  versions: draftVersions,
};
