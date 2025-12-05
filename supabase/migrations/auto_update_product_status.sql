-- Trigger pour mettre à jour automatiquement le statut des produits
-- Quand quantity = 0, status = 'out_of_stock'
-- Quand quantity > 0 et < 10, status = 'low_stock' (si pas déjà 'archived')
-- Quand quantity >= 10, status = 'in_stock' (si pas déjà 'archived')

CREATE OR REPLACE FUNCTION update_product_status_on_quantity_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Si le produit est archivé, ne pas modifier le statut
  IF NEW.status = 'archived' THEN
    RETURN NEW;
  END IF;

  -- Mettre à jour le statut selon la quantité
  IF NEW.quantity = 0 THEN
    NEW.status := 'out_of_stock';
  ELSIF NEW.quantity > 0 AND NEW.quantity < 10 THEN
    -- Seulement si le statut actuel n'est pas 'archived'
    IF NEW.status != 'archived' THEN
      NEW.status := 'low_stock';
    END IF;
  ELSIF NEW.quantity >= 10 THEN
    -- Seulement si le statut actuel n'est pas 'archived'
    IF NEW.status != 'archived' THEN
      NEW.status := 'in_stock';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger sur la table products
DROP TRIGGER IF EXISTS trigger_update_product_status ON public.products;

CREATE TRIGGER trigger_update_product_status
  BEFORE INSERT OR UPDATE OF quantity, status ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION update_product_status_on_quantity_change();

-- Mettre à jour les produits existants qui ont quantity = 0 mais status != 'out_of_stock'
UPDATE public.products
SET status = 'out_of_stock'
WHERE quantity = 0 AND status != 'out_of_stock' AND status != 'archived';


