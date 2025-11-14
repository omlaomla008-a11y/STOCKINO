"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Edit, Search, X } from "lucide-react";

import { AddProductDialog } from "@/components/products/add-product-dialog";
import { EditProductDialog } from "@/components/products/edit-product-dialog";
import { DeleteProductDialog } from "@/components/products/delete-product-dialog";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PRODUCT_STATUSES, formatCurrencySimple } from "@/lib/constants";

type Product = {
  id: string;
  organization_id: string;
  name: string;
  category: string | null;
  description: string | null;
  status: string;
  quantity: number;
  price: number | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

type ProductsClientProps = {
  organizationId: string | null;
  initialProducts: Product[];
};

export function ProductsClient({ organizationId, initialProducts }: ProductsClientProps) {
  const t = useTranslations("products");
  const tCommon = useTranslations("common");
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const router = useRouter();

  const statusLabels: Record<string, string> = {
    in_stock: t("status.in_stock"),
    low_stock: t("status.low_stock"),
    out_of_stock: t("status.out_of_stock"),
    archived: t("status.archived"),
  };

  const statusOptions: Array<{ value: (typeof PRODUCT_STATUSES)[number]; label: string }> = [
    { value: "in_stock", label: t("status.in_stock") },
    { value: "low_stock", label: t("status.low_stock") },
    { value: "out_of_stock", label: t("status.out_of_stock") },
    { value: "archived", label: t("status.archived") },
  ];

  // Synchroniser avec les données initiales quand elles changent
  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  // Extraire les catégories uniques
  const categories = useMemo(() => {
    const cats = new Set<string>();
    initialProducts.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats).sort();
  }, [initialProducts]);

  // Filtrer les produits
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        searchQuery === "" ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;

      const matchesStatus = selectedStatus === "all" || product.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchQuery, selectedCategory, selectedStatus]);

  const totalStock = useMemo(
    () => filteredProducts.reduce((acc, product) => acc + product.quantity, 0),
    [filteredProducts],
  );

  const handleProductCreated = (product: Product) => {
    setProducts((prev) => [product, ...prev]);
    router.refresh();
  };

  const handleProductUpdated = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)),
    );
    setEditingProduct(null);
    router.refresh();
  };

  const handleProductDeleted = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    router.refresh();
  };

  const canCreate = Boolean(organizationId);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedStatus("all");
  };

  const hasActiveFilters = searchQuery !== "" || selectedCategory !== "all" || selectedStatus !== "all";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <AddProductDialog
          organizationId={organizationId ?? ""}
          disabled={!canCreate}
          onProductCreated={handleProductCreated}
        />
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
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("stats.active")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{filteredProducts.length}</p>
            {hasActiveFilters && (
              <p className="text-xs text-muted-foreground">
                sur {products.length} total
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("stats.totalStock")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{totalStock}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">{t("table.product")}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {filteredProducts.length === 0 && products.length > 0
                  ? t("table.noProductsFiltered")
                  : filteredProducts.length === 0
                    ? t("table.noProducts")
                    : `${filteredProducts.length} produit${filteredProducts.length > 1 ? "s" : ""} trouvé${filteredProducts.length > 1 ? "s" : ""}.`}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t("filters.allCategories")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allCategories")}</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t("filters.allStatuses")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allStatuses")}</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="whitespace-nowrap"
              >
                <X className="mr-2 h-4 w-4" />
                {t("filters.reset")}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table.product")}</TableHead>
                <TableHead>{t("table.category")}</TableHead>
                <TableHead>{t("table.stock")}</TableHead>
                <TableHead>{t("table.status")}</TableHead>
                <TableHead>{t("table.price")}</TableHead>
                <TableHead className="text-right">{t("table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                    {products.length === 0
                      ? t("table.noProducts")
                      : t("table.noProductsFiltered")}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 overflow-hidden rounded-md bg-muted">
                          {product.image_url ? (
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              fill
                              className="object-cover"
                              unoptimized={product.image_url.includes("supabase.co")}
                              onError={(e) => {
                                // Si l'image ne charge pas, afficher le placeholder
                                e.currentTarget.style.display = "none";
                                const parent = e.currentTarget.parentElement;
                                if (parent && !parent.querySelector("span")) {
                                  const placeholder = document.createElement("span");
                                  placeholder.className = "flex h-full w-full items-center justify-center text-xs text-muted-foreground";
                                  placeholder.textContent = product.name.slice(0, 2).toUpperCase();
                                  parent.appendChild(placeholder);
                                }
                              }}
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                              {product.name.slice(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span>{product.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ID: {product.id.slice(0, 8)}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.category ?? "—"}</TableCell>
                    <TableCell>{product.quantity}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.status === "out_of_stock"
                            ? "destructive"
                            : product.status === "low_stock"
                              ? "secondary"
                              : "default"
                        }
                      >
                        {statusLabels[product.status] ?? product.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {product.price != null ? formatCurrencySimple(product.price) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <DeleteProductDialog
                          product={{ id: product.id, name: product.name }}
                          onProductDeleted={handleProductDeleted}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editingProduct && (
        <EditProductDialog
          product={editingProduct}
          open={Boolean(editingProduct)}
          onOpenChange={(open) => !open && setEditingProduct(null)}
          onProductUpdated={handleProductUpdated}
        />
      )}
    </div>
  );
}

