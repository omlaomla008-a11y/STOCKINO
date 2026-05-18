import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownContentProps = {
  content: string;
};

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="mt-8 scroll-m-20 text-3xl font-bold tracking-tight first:mt-0">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="mt-8 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="mt-6 scroll-m-20 text-xl font-semibold tracking-tight">{children}</h3>
        ),
        p: ({ children }) => <p className="leading-7 [&:not(:first-child)]:mt-4">{children}</p>,
        ul: ({ children }) => <ul className="my-4 ml-6 list-disc space-y-2">{children}</ul>,
        ol: ({ children }) => <ol className="my-4 ml-6 list-decimal space-y-2">{children}</ol>,
        li: ({ children }) => <li className="leading-7">{children}</li>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        a: ({ href, children }) => {
          const isInternal = href?.startsWith("/");
          if (isInternal && href) {
            return (
              <Link href={href} className="font-medium text-primary underline underline-offset-4">
                {children}
              </Link>
            );
          }
          return (
            <a
              href={href}
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
