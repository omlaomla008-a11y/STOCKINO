"use client";

import { useEffect } from "react";

type GoogleAdUnitProps = {
  clientId: string;
  slot: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  className?: string;
  label?: string;
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/** Bloc annonce AdSense (après approbation du compte). */
export function GoogleAdUnit({
  clientId,
  slot,
  format = "auto",
  className,
  label = "Publicité",
}: GoogleAdUnitProps) {
  useEffect(() => {
    if (!clientId || !slot) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // ignore si script pas encore chargé
    }
  }, [clientId, slot]);

  if (!clientId || !slot) return null;

  return (
    <aside className={className} aria-label={label}>
      <p className="mb-2 text-center text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <ins
        className="adsbygoogle block min-h-[90px] w-full"
        style={{ display: "block" }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </aside>
  );
}
