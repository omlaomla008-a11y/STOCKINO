-- Table des ventes
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des lignes de vente
CREATE TABLE IF NOT EXISTS public.sales_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  subtotal NUMERIC(10, 2) NOT NULL GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_sales_organization_id ON public.sales(organization_id);
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON public.sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_created_by ON public.sales(created_by);
CREATE INDEX IF NOT EXISTS idx_sales_items_sale_id ON public.sales_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sales_items_product_id ON public.sales_items(product_id);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour sales
CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour calculer le total_amount automatiquement
CREATE OR REPLACE FUNCTION calculate_sale_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.sales
  SET total_amount = (
    SELECT COALESCE(SUM(subtotal), 0)
    FROM public.sales_items
    WHERE sale_id = COALESCE(NEW.sale_id, OLD.sale_id)
  )
  WHERE id = COALESCE(NEW.sale_id, OLD.sale_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers pour mettre à jour le total_amount
CREATE TRIGGER update_sale_total_on_insert
  AFTER INSERT ON public.sales_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_sale_total();

CREATE TRIGGER update_sale_total_on_update
  AFTER UPDATE ON public.sales_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_sale_total();

CREATE TRIGGER update_sale_total_on_delete
  AFTER DELETE ON public.sales_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_sale_total();

-- RLS (Row Level Security)
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_items ENABLE ROW LEVEL SECURITY;

-- Politique pour sales : les utilisateurs peuvent voir/modifier les ventes de leur organisation
CREATE POLICY "Users can view sales from their organization"
  ON public.sales FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert sales for their organization"
  ON public.sales FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update sales from their organization"
  ON public.sales FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete sales from their organization"
  ON public.sales FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Politique pour sales_items : les utilisateurs peuvent gérer les items des ventes de leur organisation
CREATE POLICY "Users can view sales_items from their organization"
  ON public.sales_items FOR SELECT
  USING (
    sale_id IN (
      SELECT id FROM public.sales
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert sales_items for their organization"
  ON public.sales_items FOR INSERT
  WITH CHECK (
    sale_id IN (
      SELECT id FROM public.sales
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update sales_items from their organization"
  ON public.sales_items FOR UPDATE
  USING (
    sale_id IN (
      SELECT id FROM public.sales
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete sales_items from their organization"
  ON public.sales_items FOR DELETE
  USING (
    sale_id IN (
      SELECT id FROM public.sales
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

