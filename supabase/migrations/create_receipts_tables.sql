-- Table des bons d'entrée/sortie
CREATE TABLE IF NOT EXISTS public.receipts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  reference VARCHAR(50) NOT NULL UNIQUE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('entry', 'exit')),
  receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des lignes de bon
CREATE TABLE IF NOT EXISTS public.receipt_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  receipt_id UUID NOT NULL REFERENCES public.receipts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_receipts_organization_id ON public.receipts(organization_id);
CREATE INDEX IF NOT EXISTS idx_receipts_receipt_date ON public.receipts(receipt_date);
CREATE INDEX IF NOT EXISTS idx_receipts_type ON public.receipts(type);
CREATE INDEX IF NOT EXISTS idx_receipts_status ON public.receipts(status);
CREATE INDEX IF NOT EXISTS idx_receipts_created_by ON public.receipts(created_by);
CREATE INDEX IF NOT EXISTS idx_receipt_items_receipt_id ON public.receipt_items(receipt_id);
CREATE INDEX IF NOT EXISTS idx_receipt_items_product_id ON public.receipt_items(product_id);

-- Fonction pour générer une référence unique
CREATE OR REPLACE FUNCTION generate_receipt_reference(receipt_type VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
  prefix VARCHAR(3);
  year_part VARCHAR(4);
  sequence_num INTEGER;
  new_reference VARCHAR(50);
BEGIN
  -- Déterminer le préfixe selon le type
  IF receipt_type = 'entry' THEN
    prefix := 'ENT';
  ELSE
    prefix := 'SOR';
  END IF;

  -- Année actuelle
  year_part := TO_CHAR(CURRENT_DATE, 'YYYY');

  -- Trouver le prochain numéro de séquence pour cette année et ce type
  SELECT COALESCE(MAX(CAST(SUBSTRING(reference FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM public.receipts
  WHERE type = receipt_type
    AND reference LIKE prefix || '-' || year_part || '-%';

  -- Générer la référence
  new_reference := prefix || '-' || year_part || '-' || LPAD(sequence_num::TEXT, 4, '0');

  RETURN new_reference;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_receipts_updated_at
  BEFORE UPDATE ON public.receipts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour mettre à jour les stocks lors de la création d'un bon
CREATE OR REPLACE FUNCTION update_stock_on_receipt()
RETURNS TRIGGER AS $$
DECLARE
  receipt_type VARCHAR;
  receipt_status VARCHAR;
BEGIN
  -- Récupérer le type et le statut du bon
  SELECT type, status INTO receipt_type, receipt_status
  FROM public.receipts
  WHERE id = NEW.receipt_id;

  -- Ne mettre à jour que si le statut est 'completed'
  IF receipt_status = 'completed' THEN
    IF receipt_type = 'entry' THEN
      -- Entrée : augmenter le stock
      UPDATE public.products
      SET quantity = quantity + NEW.quantity,
          status = CASE
            WHEN quantity + NEW.quantity = 0 THEN 'out_of_stock'
            WHEN quantity + NEW.quantity < 10 THEN 'low_stock'
            ELSE 'in_stock'
          END
      WHERE id = NEW.product_id;
    ELSIF receipt_type = 'exit' THEN
      -- Sortie : diminuer le stock (vérifier que le stock est suffisant)
      UPDATE public.products
      SET quantity = GREATEST(0, quantity - NEW.quantity),
          status = CASE
            WHEN GREATEST(0, quantity - NEW.quantity) = 0 THEN 'out_of_stock'
            WHEN GREATEST(0, quantity - NEW.quantity) < 10 THEN 'low_stock'
            ELSE 'in_stock'
          END
      WHERE id = NEW.product_id
        AND quantity >= NEW.quantity;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour les stocks lors de l'insertion d'un item
CREATE TRIGGER update_stock_on_receipt_insert
  AFTER INSERT ON public.receipt_items
  FOR EACH ROW
  EXECUTE FUNCTION update_stock_on_receipt();

-- Fonction pour restaurer les stocks lors de la suppression d'un bon
CREATE OR REPLACE FUNCTION restore_stock_on_receipt_delete()
RETURNS TRIGGER AS $$
DECLARE
  receipt_type VARCHAR;
BEGIN
  -- Récupérer le type du bon
  SELECT type INTO receipt_type
  FROM public.receipts
  WHERE id = OLD.receipt_id;

  -- Restaurer les stocks seulement si le bon était complété
  IF OLD.receipt_id IN (SELECT id FROM public.receipts WHERE status = 'completed') THEN
    IF receipt_type = 'entry' THEN
      -- Entrée supprimée : diminuer le stock
      UPDATE public.products
      SET quantity = GREATEST(0, quantity - OLD.quantity),
          status = CASE
            WHEN GREATEST(0, quantity - OLD.quantity) = 0 THEN 'out_of_stock'
            WHEN GREATEST(0, quantity - OLD.quantity) < 10 THEN 'low_stock'
            ELSE 'in_stock'
          END
      WHERE id = OLD.product_id;
    ELSIF receipt_type = 'exit' THEN
      -- Sortie supprimée : augmenter le stock
      UPDATE public.products
      SET quantity = quantity + OLD.quantity,
          status = CASE
            WHEN quantity + OLD.quantity = 0 THEN 'out_of_stock'
            WHEN quantity + OLD.quantity < 10 THEN 'low_stock'
            ELSE 'in_stock'
          END
      WHERE id = OLD.product_id;
    END IF;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour restaurer les stocks lors de la suppression d'un item
CREATE TRIGGER restore_stock_on_receipt_item_delete
  AFTER DELETE ON public.receipt_items
  FOR EACH ROW
  EXECUTE FUNCTION restore_stock_on_receipt_delete();

-- RLS (Row Level Security)
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_items ENABLE ROW LEVEL SECURITY;

-- Politique pour receipts : les utilisateurs peuvent voir/modifier les bons de leur organisation
CREATE POLICY "Users can view receipts from their organization"
  ON public.receipts FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert receipts for their organization"
  ON public.receipts FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update receipts from their organization"
  ON public.receipts FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete receipts from their organization"
  ON public.receipts FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Politique pour receipt_items : les utilisateurs peuvent gérer les items des bons de leur organisation
CREATE POLICY "Users can view receipt_items from their organization"
  ON public.receipt_items FOR SELECT
  USING (
    receipt_id IN (
      SELECT id FROM public.receipts
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert receipt_items for their organization"
  ON public.receipt_items FOR INSERT
  WITH CHECK (
    receipt_id IN (
      SELECT id FROM public.receipts
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update receipt_items from their organization"
  ON public.receipt_items FOR UPDATE
  USING (
    receipt_id IN (
      SELECT id FROM public.receipts
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete receipt_items from their organization"
  ON public.receipt_items FOR DELETE
  USING (
    receipt_id IN (
      SELECT id FROM public.receipts
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

