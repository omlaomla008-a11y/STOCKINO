import Script from "next/script";

import { getAdSenseClientId } from "@/lib/analytics/adsense";

/** Script AdSense (vérification + annonces auto) — hub public uniquement. */
export function GoogleAdSenseScript() {
  const clientId = getAdSenseClientId();
  if (!clientId) return null;

  return (
    <Script
      id="google-adsense"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
