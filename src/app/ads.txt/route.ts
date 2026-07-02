import { getAdSenseAdsTxtPublisherId } from "@/lib/analytics/adsense";

export function GET() {
  const publisherId = getAdSenseAdsTxtPublisherId();
  if (!publisherId) {
    return new Response("# AdSense non configuré\n", {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const body = `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
