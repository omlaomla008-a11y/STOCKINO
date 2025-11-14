"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, ShoppingBag, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("stats.activeProducts")}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">{t("stats.activeProducts")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("stats.outOfStock")}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-destructive">{stats.outOfStock}</div>
            <p className="text-xs text-muted-foreground">{t("stats.outOfStock")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("stats.todaySales")}</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {formatCurrencySimple(stats.todaySales.amount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.todaySales.count} vente{stats.todaySales.count > 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("stats.totalStock")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{stats.totalStock}</div>
            <p className="text-xs text-muted-foreground">{t("stats.totalStock")}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("stats.monthlySales")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {formatCurrencySimple(stats.monthlySales.amount)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {stats.monthlySales.count} vente{stats.monthlySales.count > 1 ? "s" : ""} ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("stats.lowStockProducts")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-destructive">
              {stats.lowStock + stats.outOfStock}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {stats.lowStock} en seuil d'alerte, {stats.outOfStock} en rupture
            </p>
          </CardContent>
        </Card>
      </div>

      {stats.recentSales.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("stats.recentSales")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium">{formatDate(sale.sale_date)}</p>
                    <p className="text-xs text-muted-foreground">Vente #{sale.id.slice(0, 8)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {formatCurrencySimple(sale.total_amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {stats.lowStockProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("stats.lowStockProducts")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.lowStockProducts.slice(0, 5).map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Stock: {product.quantity} unité{product.quantity > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div>
                    {product.status === "out_of_stock" ? (
                      <span className="text-xs font-medium text-destructive">Rupture</span>
                    ) : (
                      <span className="text-xs font-medium text-orange-600">Seuil d'alerte</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {stats.recentSales.length === 0 && (
        <Card>
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            {t("noSales")}
          </CardContent>
        </Card>
      )}

      {stats.lowStockProducts.length === 0 && (
        <Card>
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            {t("noLowStock")}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

