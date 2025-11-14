"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Search, Trash2, X } from "lucide-react";

import { CreateSaleDialog } from "@/components/sales/create-sale-dialog";
import { DeleteSaleDialog } from "@/components/sales/delete-sale-dialog";
import { useTranslations } from "@/components/i18n/translations-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrencySimple } from "@/lib/constants";

type Sale = {
  id: string;
  organization_id: string;
  sale_date: string;
  total_amount: number;
  created_by: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items_count?: number;
};

type Product = {
  id: string;
  name: string;
  price: number | null;
  quantity: number;
  category: string | null;
};

type SalesClientProps = {
  organizationId: string | null;
  initialSales: Sale[];
  products: Product[];
};

export function SalesClient({
  organizationId,
  initialSales,
  products,
}: SalesClientProps) {
  const t = useTranslations("sales");
  const tCommon = useTranslations("common");
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<"day" | "week" | "month">("day");
  const [deletingSaleId, setDeletingSaleId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setSales(initialSales);
  }, [initialSales]);

  // Filtrer les ventes par période
  const filteredByPeriod = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return sales.filter((sale) => {
      const saleDate = new Date(sale.sale_date);

      switch (dateFilter) {
        case "day":
          return saleDate >= today;
        case "week": {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return saleDate >= weekAgo;
        }
        case "month": {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return saleDate >= monthAgo;
        }
        default:
          return true;
      }
    });
  }, [sales, dateFilter]);

  // Filtrer par recherche
  const filteredSales = useMemo(() => {
    if (!searchQuery) return filteredByPeriod;

    const query = searchQuery.toLowerCase();
    return filteredByPeriod.filter((sale) => {
      const dateStr = new Date(sale.sale_date).toLocaleDateString("fr-FR");
      const totalStr = sale.total_amount.toFixed(2);
      const notesStr = sale.notes?.toLowerCase() ?? "";

      return (
        dateStr.includes(query) ||
        totalStr.includes(query) ||
        notesStr.includes(query) ||
        sale.id.toLowerCase().includes(query)
      );
    });
  }, [filteredByPeriod, searchQuery]);

  // Statistiques
  const stats = useMemo(() => {
    const total = filteredSales.reduce((sum, sale) => sum + sale.total_amount, 0);
    const count = filteredSales.length;
    const average = count > 0 ? total / count : 0;

    return { total, count, average };
  }, [filteredSales]);

  const handleSaleCreated = () => {
    router.refresh();
  };

  const handleSaleDeleted = (saleId: string) => {
    setSales((prev) => prev.filter((s) => s.id !== saleId));
    setDeletingSaleId(null);
    router.refresh();
  };

  const canCreate = Boolean(organizationId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
        {canCreate ? (
          <CreateSaleDialog
            organizationId={organizationId}
            products={products}
            onSaleCreated={handleSaleCreated}
          />
        ) : (
          <Button disabled>+ {t("add")}</Button>
        )}
      </div>

      {!canCreate ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("noOrganization.title")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {t("noOrganization.description")}
          </CardContent>
        </Card>
      ) : (
        <>
          <Tabs value={dateFilter} onValueChange={(v) => setDateFilter(v as typeof dateFilter)}>
            <TabsList>
              <TabsTrigger value="day">{t("filters.today")}</TabsTrigger>
              <TabsTrigger value="week">{t("filters.week")}</TabsTrigger>
              <TabsTrigger value="month">{t("filters.month")}</TabsTrigger>
            </TabsList>
            <TabsContent value={dateFilter} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {t("stats.count")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold">{stats.count}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {t("stats.total")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold">{formatCurrencySimple(stats.total)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {t("stats.average")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold">{formatCurrencySimple(stats.average)}</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">{t("table.date")}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {filteredSales.length === 0
                          ? t("table.noSalesFiltered")
                          : `${filteredSales.length} ${filteredSales.length > 1 ? t("table.countPlural") : t("table.count")}.`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder={t("search")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    {searchQuery && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchQuery("")}
                        className="whitespace-nowrap"
                      >
                        <X className="mr-2 h-4 w-4" />
                        {t("clear")}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="px-0">
                  {filteredSales.length === 0 ? (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                      {sales.length === 0
                        ? t("table.noSales")
                        : t("table.noSalesFiltered")}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("table.date")}</TableHead>
                          <TableHead>{t("table.amount")}</TableHead>
                          <TableHead>{t("table.notes")}</TableHead>
                          <TableHead>{t("table.created")}</TableHead>
                          <TableHead className="text-right">{t("table.actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSales.map((sale) => (
                          <TableRow key={sale.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{formatDate(sale.sale_date)}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold">
                              {formatCurrencySimple(sale.total_amount)}
                            </TableCell>
                            <TableCell>
                              {sale.notes ? (
                                <span className="text-sm text-muted-foreground">{sale.notes}</span>
                              ) : (
                                <span className="text-sm text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDateTime(sale.created_at)}
                            </TableCell>
                            <TableCell className="text-right">
                              <DeleteSaleDialog
                                sale={{
                                  id: sale.id,
                                  saleDate: sale.sale_date,
                                  totalAmount: sale.total_amount,
                                }}
                                onSaleDeleted={handleSaleDeleted}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

