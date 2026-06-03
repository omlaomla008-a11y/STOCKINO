import Image from "next/image";

import { absoluteUrl } from "@/lib/seo/site";

type BlogCoverImageProps = {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
};

function toImageSrc(src: string): string {
  const trimmed = src.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return absoluteUrl(trimmed.startsWith("/") ? trimmed : `/${trimmed}`);
}

export function BlogCoverImage({ src, alt, priority, className }: BlogCoverImageProps) {
  const resolved = toImageSrc(src);

  return (
    <div
      className={
        className ??
        "relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-xl border bg-muted"
      }
    >
      <Image
        src={resolved}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 672px"
        priority={priority}
      />
    </div>
  );
}
