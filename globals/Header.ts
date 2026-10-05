import type { GlobalConfig } from "payload";
import { anyone, authenticated } from "../collections/access";

export const Header: GlobalConfig = {
  slug: "header",
  access: {
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: "logoUrl",
      type: "text",
    },
    {
      name: "nav",
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
