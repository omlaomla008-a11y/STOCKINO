-- Ajouter les champs de facturation à la table receipts
ALTER TABLE public.receipts
  ADD COLUMN IF NOT EXISTS vat_rate DECIMAL(5,2) DEFAULT 20.00 CHECK (vat_rate >= 0 AND vat_rate <= 100),
  ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12,2) DEFAULT 0.00 CHECK (subtotal >= 0),
  ADD COLUMN IF NOT EXISTS vat_amount DECIMAL(12,2) DEFAULT 0.00 CHECK (vat_amount >= 0),
  ADD COLUMN IF NOT EXISTS total_amount DECIMAL(12,2) DEFAULT 0.00 CHECK (total_amount >= 0),
  ADD COLUMN IF NOT EXISTS is_invoice BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(50) UNIQUE;

-- Ajouter le prix unitaire dans receipt_items
ALTER TABLE public.receipt_items
  ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2) DEFAULT 0.00 CHECK (unit_price >= 0);

-- Créer un index pour invoice_number
CREATE INDEX IF NOT EXISTS idx_receipts_invoice_number ON public.receipts(invoice_number);

-- Fonction pour générer un numéro de facture unique
CREATE OR REPLACE FUNCTION generate_invoice_number(org_id UUID)
RETURNS VARCHAR AS $$
DECLARE
  year_part VARCHAR(4);
  sequence_num INTEGER;
  new_invoice_number VARCHAR(50);
BEGIN
  -- Année actuelle
  year_part := TO_CHAR(CURRENT_DATE, 'YYYY');

  -- Trouver le prochain numéro de séquence pour cette année et cette organisation
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM public.receipts
  WHERE organization_id = org_id
    AND invoice_number LIKE 'FAC-' || year_part || '-%';

  -- Générer le numéro de facture
  new_invoice_number := 'FAC-' || year_part || '-' || LPAD(sequence_num::TEXT, 4, '0');

  RETURN new_invoice_number;
END;
$$ LANGUAGE plpgsql;

