-- Ajouter la colonne updated_at si elle n'existe pas dans la table sales
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'sales' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.sales 
    ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Fix pour le trigger calculate_sale_total
-- Supprimer l'ancien trigger
DROP TRIGGER IF EXISTS update_sale_total_on_insert ON public.sales_items;
DROP TRIGGER IF EXISTS update_sale_total_on_update ON public.sales_items;
DROP TRIGGER IF EXISTS update_sale_total_on_delete ON public.sales_items;

-- Recréer la fonction pour calculer le total
CREATE OR REPLACE FUNCTION calculate_sale_total()
RETURNS TRIGGER AS $$
DECLARE
  sale_id_val UUID;
BEGIN
  -- Récupérer le sale_id selon le type de trigger
  IF TG_OP = 'DELETE' THEN
    sale_id_val := OLD.sale_id;
  ELSE
    sale_id_val := NEW.sale_id;
  END IF;

  -- Mettre à jour le total_amount dans sales
  UPDATE public.sales
  SET total_amount = (
    SELECT COALESCE(SUM(subtotal), 0)
    FROM public.sales_items
    WHERE sale_id = sale_id_val
  ),
  updated_at = NOW()  -- Mettre à jour updated_at directement ici
  WHERE id = sale_id_val;

  -- Retourner le bon record selon le type d'opération
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Recréer les triggers
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


