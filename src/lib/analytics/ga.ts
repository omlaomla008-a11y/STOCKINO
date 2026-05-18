/** ID de mesure GA4 (ex. G-EHQY82PQ0F) — variable `NEXT_PUBLIC_GA_MEASUREMENT_ID`. */
export function getGaMeasurementId(): string | null {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  if (!id || !/^G-[A-Z0-9]+$/i.test(id)) return null;
  return id;
}
