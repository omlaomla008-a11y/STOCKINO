import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { normalizeBlogCoverSrc } from "@/lib/hub/blog-cover";
import type { BlogPostMeta } from "@/types/hub";

type BlogCardProps = {
  post: BlogPostMeta;
};

export function BlogCard({ post }: BlogCardProps) {
  const date = new Date(post.publishedAt);
  const image = normalizeBlogCoverSrc(post.coverImage);

  return (
    <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
      {image ? (
        <Link href={`/blog/${post.slug}`} className="block aspect-[16/9] overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" className="h-full w-full object-cover" loading="lazy" />
        </Link>
      ) : null}
      <CardHeader className="space-y-3">
        {post.category ? <Badge variant="secondary">{post.category}</Badge> : null}
        <CardTitle className="text-xl leading-snug">
          <Link href={`/blog/${post.slug}`} className="hover:underline">
            {post.title}
          </Link>
        </CardTitle>
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {format(date, "d MMMM yyyy", { locale: fr })}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">{post.description}</p>
        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center text-sm font-medium text-primary hover:underline"
        >
          Lire l&apos;article
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
