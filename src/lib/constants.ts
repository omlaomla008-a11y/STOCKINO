export const USER_ROLES = ["admin", "manager", "operator"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const PRODUCT_STATUSES = [
  "in_stock",
  "low_stock",
  "out_of_stock",
  "archived",
] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const DASHBOARD_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "long",
  day: "numeric",
  month: "long",
};

// Configuration de la devise (Dirham marocain)
export const CURRENCY = {
  code: "MAD",
  symbol: "د.م.",
  locale: "fr-MA",
} as const;

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(CURRENCY.locale, {
    style: "currency",
    currency: CURRENCY.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCurrencySimple(amount: number): string {
  return `${amount.toFixed(2)} ${CURRENCY.symbol}`;
}
