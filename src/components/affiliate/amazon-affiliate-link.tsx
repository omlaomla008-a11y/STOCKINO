import { ExternalLink } from "lucide-react";

import { buildAmazonAffiliateUrl } from "@/lib/affiliate/amazon";
import { cn } from "@/lib/utils";

type AmazonAffiliateLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  showIcon?: boolean;
};

/**
 * Lien externe avec tag d'affiliation Amazon si configuré.
 */
export function AmazonAffiliateLink({
  href,
  children,
  className,
  showIcon = true,
}: AmazonAffiliateLinkProps) {
  const affiliateHref = buildAmazonAffiliateUrl(href);

  return (
    <a
      href={affiliateHref}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={cn("inline-flex items-center gap-1", className)}
    >
      {children}
      {showIcon ? <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" /> : null}
    </a>
  );
}
