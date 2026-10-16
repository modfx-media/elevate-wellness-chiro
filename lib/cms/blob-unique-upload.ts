import { APIError, Forbidden } from "payload";
import type { Config, Plugin } from "payload";
import { resolveSignedURLKey } from "@payloadcms/plugin-cloud-storage/utilities";
import { assertClientUploadAccess, assertClientUploadAllowed } from "payload/internal";

const ROUTE = "/vercel-blob-client-upload-route";

/**
 * Always issue a unique Blob key for client uploads.
 *
 * @payloadcms/storage-vercel-blob 3.90.x treats any upload whose filename matches an existing
 * media doc as an "overwrite": the browser sends the file to the plain filename key, but Payload
 * then renames the new doc (name-1.jpg), so the new doc points at a file that does not exist
 * (broken image) or the request hangs. Issuing the key the same way as for a new filename (unique
 * per-upload folder, deduped filename) keeps the doc and the Blob object in sync.
 *
 * Add this plugin AFTER vercelBlobStorage(). The token-generation step of the route is untouched.
 */
export const blobUniqueClientUploads = (): Plugin => (config: Config): Config => {
  config.endpoints = (config.endpoints ?? []).map((endpoint) => {
    if (endpoint.path !== ROUTE || String(endpoint.method).toLowerCase() !== "post") return endpoint;
    const original = endpoint.handler;
    return {
      ...endpoint,
      handler: async (req) => {
        if (req.searchParams?.get("issue-client-upload") !== "1") return original(req);
        try {
          const body = (await req.json?.()) as {
            collectionSlug?: unknown;
            docPrefix?: unknown;
            filename?: unknown;
            mimeType?: unknown;
          };
          const { collectionSlug, docPrefix, filename, mimeType } = body ?? {};
          if (
            typeof collectionSlug !== "string" ||
            typeof filename !== "string" ||
            typeof mimeType !== "string" ||
            (docPrefix !== undefined && typeof docPrefix !== "string") ||
            collectionSlug !== "media"
          ) {
            throw new APIError("Invalid upload payload", 400);
          }
          await assertClientUploadAccess({ collectionSlug, req });
          if (!req.user) throw new Forbidden();
          assertClientUploadAllowed({
            collection: req.payload.collections[collectionSlug]?.config,
            filename,
            mimeType,
          });
          const resolved = await resolveSignedURLKey({
            collectionPrefix: "",
            collectionSlug,
            docPrefix,
            filename,
            req,
            useCompositePrefixes: false,
          });
          return Response.json({
            clientUploadContext: resolved.clientUploadContext,
            filename: resolved.sanitizedFilename,
            pathname: resolved.storageFilePath,
          });
        } catch (error) {
          if (error instanceof APIError) throw error;
          req.payload.logger.error(error);
          throw new APIError("storage-vercel-blob client upload route error");
        }
      },
    };
  });
  return config;
};
