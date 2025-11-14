-- Ajouter le champ code à la table organizations
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS code VARCHAR(8) UNIQUE;

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_organizations_code ON organizations(code);

-- Générer des codes pour les organisations existantes
DO $$
DECLARE
    org_record RECORD;
    new_code VARCHAR(8);
BEGIN
    FOR org_record IN SELECT id FROM organizations WHERE code IS NULL LOOP
        -- Générer un code alphanumérique unique de 6 caractères
        LOOP
            new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || org_record.id::TEXT) FROM 1 FOR 6));
            EXIT WHEN NOT EXISTS (SELECT 1 FROM organizations WHERE code = new_code);
        END LOOP;
        
        UPDATE organizations SET code = new_code WHERE id = org_record.id;
    END LOOP;
END $$;

