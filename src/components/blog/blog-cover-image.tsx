import { normalizeBlogCoverSrc } from "@/lib/hub/blog-cover";

type BlogCoverImageProps = {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
};

/**
 * Affichage couverture article : balise img native pour éviter les blocages
 * du optimiseur Next.js sur les URLs Supabase ou médias externes.
 */
export function BlogCoverImage({ src, alt, priority, className }: BlogCoverImageProps) {
  const resolved = normalizeBlogCoverSrc(src);
  if (!resolved) return null;

  return (
    <div
      className={
        className ??
        "relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-xl border bg-muted"
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolved}
        alt={alt}
        className="h-full w-full object-cover"
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    </div>
  );
}
