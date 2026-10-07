import type { Access, CollectionConfig } from "payload";
import { authenticated } from "./access";

/** First user may self-register; afterward only authenticated admins create users. */
const createFirstUserOrAuthenticated: Access = async ({ req }) => {
  if (req.user) return true;
  const users = await req.payload.find({
    collection: "users",
    limit: 1,
    depth: 0,
  });
  return users.totalDocs === 0;
};

export const Users: CollectionConfig = {
  slug: "users",
  access: {
    admin: ({ req: { user } }) => Boolean(user),
    create: createFirstUserOrAuthenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ["name", "email"],
    useAsTitle: "name",
  },
  auth: true,
  fields: [
    {
      name: "name",
      type: "text",
    },
  ],
  timestamps: true,
};
