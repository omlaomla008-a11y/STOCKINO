import { GoogleAnalytics } from "@next/third-parties/google";

import { getGaMeasurementId } from "@/lib/analytics/ga";

/** Charge gtag.js uniquement si `NEXT_PUBLIC_GA_MEASUREMENT_ID` est défini. */
export function GoogleAnalyticsProvider() {
  const gaId = getGaMeasurementId();
  if (!gaId) return null;
  return <GoogleAnalytics gaId={gaId} />;
}
