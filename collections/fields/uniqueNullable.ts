import type { TextField } from "payload";

/** Unique text that stores empty as `null` so create forms do not collide. */
export function uniqueNullableText(
  name: string,
  overrides: Omit<TextField, "name" | "type" | "unique" | "hasMany"> = {},
): TextField {
  return {
    name,
    type: "text",
    unique: true,
    ...overrides,
    hooks: {
      ...overrides.hooks,
      beforeValidate: [
        ({ value }) => {
          if (value === "" || value === undefined) return null;
          return value;
        },
        ...(overrides.hooks?.beforeValidate ?? []),
      ],
    },
  } as TextField;
}
