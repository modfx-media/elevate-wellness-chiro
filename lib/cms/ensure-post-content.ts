import { sql } from "@payloadcms/db-vercel-postgres";
import type { Payload } from "payload";

type DrizzleExecutor = {
  drizzle?: {
    execute: (query: ReturnType<typeof sql.raw>) => Promise<unknown>;
  };
};

/**
 * Adds the posts rich-text column if it is missing.
 * Nullable and idempotent — existing rows and `_status` are left untouched.
 * Vercel keeps `push: false`, so new fields are not created automatically.
 */
export async function ensurePostContentColumns(payload: Payload): Promise<void> {
  const drizzle = (payload.db as DrizzleExecutor | undefined)?.drizzle;
  if (!drizzle?.execute) return;

  const statements = [
    `ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "content" jsonb`,
    `ALTER TABLE "_posts_v" ADD COLUMN IF NOT EXISTS "version_content" jsonb`,
  ];

  try {
    for (const statement of statements) {
      await drizzle.execute(sql.raw(statement));
    }
  } catch (error) {
    console.error("[cms] posts.content column was not added", error);
  }
}
