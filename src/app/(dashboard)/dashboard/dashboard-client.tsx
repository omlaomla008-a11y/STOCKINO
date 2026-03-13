"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Package, ShoppingBag, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrencySimple } from "@/lib/constants";
import { useTranslations } from "@/components/i18n/translations-provider";

type DashboardStats = {
  totalProducts: number;
  outOfStock: number;
  lowStock: number;
  totalStock: number;
  todaySales: {
    count: number;
    amount: number;
  };
  monthlySales: {
    count: number;
    amount: number;
  };
  recentSales: Array<{
    id: string;
    sale_date: string;
    total_amount: number;
  }>;
  lowStockProducts: Array<{
    id: string;
    name: string;
    quantity: number;
    status: string;
  }>;
};

type DashboardClientProps = {
  organizationId: string | null;
  initialStats: DashboardStats | null;
};

export function DashboardClient({ organizationId, initialStats }: DashboardClientProps) {
  const t = useTranslations("dashboard");
  const [stats, setStats] = useState<DashboardStats | null>(initialStats);
  const router = useRouter();

  useEffect(() => {
    setStats(initialStats);
  }, [initialStats]);

  if (!organizationId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("noOrganization.hint")}</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{t("noOrganization.title")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {t("noOrganization.description")}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-sky-700 via-sky-600 to-sky-500 px-6 py-6 text-white shadow-sm dark:border-slate-800 dark:from-sky-900 dark:via-sky-800 dark:to-sky-700">
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -left-12 bottom-0 h-32 w-32 rounded-full bg-sky-900/20 blur-2xl dark:bg-sky-950/30" />
        <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
            <p className="mt-1 max-w-xl text-sm text-sky-50/90">{t("description")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-emerald-500/90 text-xs font-medium text-white hover:bg-emerald-500">
              {stats.todaySales.count} vente{stats.todaySales.count > 1 ? "s" : ""} aujourd&apos;hui
            </Badge>
            <Badge
              variant="outline"
              className="border-sky-100/50 bg-sky-900/10 text-xs font-medium text-sky-50 dark:border-sky-200/20 dark:bg-sky-950/20"
            >
              Stock total&nbsp;: {stats.totalStock}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-slate-200/80 bg-slate-950/[0.02] dark:border-slate-800 dark:bg-slate-900/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {t("stats.activeProducts")}
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300">
              <Package className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
              {stats.totalProducts}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t("stats.activeProducts")}</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200/80 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/25">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-200">
              {t("stats.outOfStock")}
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-amber-900 dark:text-amber-100">
              {stats.outOfStock}
            </div>
            <p className="text-xs text-amber-800/80 dark:text-amber-200/70">
              {t("stats.outOfStock")}
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200/80 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
              {t("stats.todaySales")}
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-emerald-900 dark:text-emerald-100">
              {formatCurrencySimple(stats.todaySales.amount)}
            </div>
            <p className="text-xs text-emerald-800/80 dark:text-emerald-200/70">
              {stats.todaySales.count} vente{stats.todaySales.count > 1 ? "s" : ""} aujourd&apos;hui
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-200">
              {t("stats.totalStock")}
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-slate-50 dark:bg-slate-100 dark:text-slate-900">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
              {stats.totalStock}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t("stats.totalStock")}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/40 lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span>{t("stats.monthlySales")}</span>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-300">
                {stats.monthlySales.count} vente
                {stats.monthlySales.count > 1 ? "s" : ""} ce mois
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-slate-900 dark:text-slate-50">
              {formatCurrencySimple(stats.monthlySales.amount)}
            </div>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {t("stats.recentSales")} &middot;{" "}
              {stats.recentSales.length === 0
                ? t("noSales")
                : `${stats.recentSales.length} dernière${
                    stats.recentSales.length > 1 ? "s" : ""
                  } vente${stats.recentSales.length > 1 ? "s" : ""}`}
            </p>

            {stats.recentSales.length > 0 && (
              <div className="mt-5 space-y-3">
                {stats.recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between rounded-lg border bg-slate-50/60 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/30"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                        {formatDate(sale.sale_date)}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Vente #{sale.id.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                        {formatCurrencySimple(sale.total_amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
          <CardHeader className="pb-3">
            <CardTitle>{t("stats.lowStockProducts")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3 flex items-baseline justify-between">
              <span className="text-3xl font-semibold text-amber-700 dark:text-amber-200">
                {stats.lowStock + stats.outOfStock}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {stats.lowStock} en seuil d&apos;alerte, {stats.outOfStock} en rupture
              </span>
            </div>

            {stats.lowStockProducts.length > 0 ? (
              <div className="space-y-2">
                {stats.lowStockProducts.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-lg border bg-amber-50/60 px-3 py-2 dark:border-amber-900/40 dark:bg-amber-950/20"
                  >
                    <div>
                      <p className="text-sm font-medium text-amber-950 dark:text-amber-100">
                        {product.name}
                      </p>
                      <p className="text-xs text-amber-800/80 dark:text-amber-200/70">
                        Stock: {product.quantity} unité{product.quantity > 1 ? "s" : ""}
                      </p>
                    </div>
                    <div>
                      {product.status === "out_of_stock" ? (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950/40 dark:text-red-200">
                          Rupture
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                          Seuil d&apos;alerte
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">{t("noLowStock")}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {stats.recentSales.length === 0 && (
        <Card className="border-dashed border-slate-300 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/30">
          <CardContent className="py-6 text-center text-sm text-slate-500">
            {t("noSales")}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

