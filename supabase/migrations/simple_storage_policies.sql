-- Politiques SIMPLES pour le bucket product-images
-- À exécuter APRÈS avoir créé le bucket et vérifié qu'il est PUBLIC

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for product-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete from product-images" ON storage.objects;
DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent uploader dans leur dossier d'organisation" ON storage.objects;
DROP POLICY IF EXISTS "Lecture publique des images de produits" ON storage.objects;
DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent supprimer dans leur dossier d'organisation" ON storage.objects;
DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent mettre à jour dans leur dossier d'organisation" ON storage.objects;

-- Politique SIMPLE : Permettre l'upload à tous les utilisateurs authentifiés
-- Le service role bypass RLS, donc cette politique est surtout pour les clients normaux
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Politique pour la lecture publique (le bucket est public, mais on le confirme)
CREATE POLICY "Public read access for product-images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Politique pour la suppression (authentifiés uniquement)
CREATE POLICY "Allow authenticated delete from product-images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');

-- Politique pour la mise à jour (authentifiés uniquement)
CREATE POLICY "Allow authenticated update in product-images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');

