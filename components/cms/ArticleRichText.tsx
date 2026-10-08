import Image from "next/image";
import { RichText, type JSXConvertersFunction } from "@payloadcms/richtext-lexical/react";
import { uploadPublicUrl } from "@/lib/cms/media-url";

type UploadNode = {
  fields?: { alt?: string | null };
  value?: unknown;
};

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  upload: ({ node }) => {
    const upload = node as UploadNode;
    const media = uploadPublicUrl(upload.value);
    if (!media) return null;
    const alt = upload.fields?.alt || media.alt;
    return (
      <figure className="my-10">
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl shadow-xl">
          <Image
            src={media.url}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 768px, 100vw"
            className="object-cover"
          />
        </div>
        {alt ? <figcaption className="mt-3 text-sm italic text-ink-700">{alt}</figcaption> : null}
      </figure>
    );
  },
});

/** Lexical body inside the designed article column (same type scale as BlogPostTemplate). */
export function ArticleRichText({ data }: { data: { root: { children: unknown[] } } }) {
  return (
    <article className="bg-white px-6 pb-16 pt-10 lg:px-8 lg:pb-20 lg:pt-14">
      <div className="mx-auto max-w-3xl space-y-5 text-base leading-relaxed text-ink-900 sm:text-lg [&_a]:font-semibold [&_a]:text-primary-700 [&_a]:underline [&_h2]:mt-12 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-navy-900 [&_h2]:sm:mt-14 [&_h2]:sm:text-3xl [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-navy-900 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_ul]:ml-1 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:marker:text-primary-500">
        <RichText converters={converters} data={data as never} />
      </div>
    </article>
  );
}
