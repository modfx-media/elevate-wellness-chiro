import type { GlobalConfig } from "payload";
import { anyone, authenticated } from "../collections/access";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  access: {
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: "siteName",
      type: "text",
    },
    {
      name: "defaultTitle",
      type: "text",
    },
    {
      name: "defaultDescription",
      type: "textarea",
    },
    {
      name: "ogImage",
      type: "upload",
      relationTo: "media",
    },
  ],
  versions: {
    drafts: {
      schedulePublish: true,
    },
    max: 50,
  },
};
