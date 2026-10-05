import type { GlobalConfig } from "payload";
import { anyone, authenticated } from "../collections/access";

export const Footer: GlobalConfig = {
  slug: "footer",
  access: {
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: "disclaimer",
      type: "textarea",
    },
    {
      name: "links",
      type: "json",
    },
  ],
  versions: {
    drafts: {
      schedulePublish: true,
    },
    max: 50,
  },
};
