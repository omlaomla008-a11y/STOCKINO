import Link from "next/link";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

import { buildAmazonAffiliateUrl, isAmazonUrl } from "@/lib/affiliate/amazon";
import { articleSanitizeSchema } from "@/lib/markdown/sanitize-schema";
import { cn } from "@/lib/utils";

type MarkdownContentProps = {
  content: string;
};

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, [rehypeSanitize, articleSanitizeSchema]]}
      components={{
        h1: ({ className, children }) => (
          <h1
            className={cn(
              "mt-8 scroll-m-20 text-3xl font-bold tracking-tight first:mt-0",
              className,
            )}
          >
            {children}
          </h1>
        ),
        h2: ({ className, children }) => (
          <h2
            className={cn(
              "mt-8 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight",
              className,
            )}
          >
            {children}
          </h2>
        ),
        h3: ({ className, children }) => (
          <h3
            className={cn("mt-6 scroll-m-20 text-xl font-semibold tracking-tight", className)}
          >
            {children}
          </h3>
        ),
        p: ({ className, children }) => (
          <p className={cn("leading-7 [&:not(:first-child)]:mt-4", className)}>{children}</p>
        ),
        div: ({ className, children }) => (
          <div className={cn("leading-7", className)}>{children}</div>
        ),
        ul: ({ children }) => <ul className="my-4 ml-6 list-disc space-y-2">{children}</ul>,
        ol: ({ children }) => <ol className="my-4 ml-6 list-decimal space-y-2">{children}</ol>,
        li: ({ children }) => <li className="leading-7">{children}</li>,
        blockquote: ({ className, children }) => (
          <blockquote
            className={cn(
              "my-4 border-l-4 border-primary/30 pl-4 italic text-muted-foreground",
              className,
            )}
          >
            {children}
          </blockquote>
        ),
        hr: () => <hr className="my-8 border-border" />,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        em: ({ children }) => <em>{children}</em>,
        img: ({ src, alt, className }) =>
          src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={alt ?? ""}
              className={cn("my-6 w-full max-w-full rounded-lg border object-cover", className)}
              loading="lazy"
              decoding="async"
            />
          ) : null,
        a: ({ href, children }) => {
          const isInternal = href?.startsWith("/");
          if (isInternal && href) {
            return (
              <Link href={href} className="font-medium text-primary underline underline-offset-4">
                {children}
              </Link>
            );
          }
          const externalHref =
            href && isAmazonUrl(href) ? buildAmazonAffiliateUrl(href) : href;
          return (
            <a
              href={externalHref}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="font-medium text-primary underline underline-offset-4"
            >
              {children}
            </a>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
