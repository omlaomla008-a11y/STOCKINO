-- Politiques de sécurité pour le bucket product-images
-- À exécuter dans le SQL Editor de Supabase

-- Supprimer les politiques existantes si elles existent (optionnel, pour éviter les doublons)
DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent uploader dans leur dossier d'organisation" ON storage.objects;
DROP POLICY IF EXISTS "Lecture publique des images de produits" ON storage.objects;
DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent supprimer dans leur dossier d'organisation" ON storage.objects;
DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent mettre à jour dans leur dossier d'organisation" ON storage.objects;

-- Politique pour permettre l'upload aux utilisateurs authentifiés
CREATE POLICY "Les utilisateurs authentifiés peuvent uploader dans leur dossier d'organisation"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' AND
  (storage.foldername(name))[1] IN (
    SELECT organization_id::text
    FROM profiles
    WHERE id = auth.uid()
  )
);

-- Politique pour permettre la lecture publique des images
CREATE POLICY "Lecture publique des images de produits"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Politique pour permettre la suppression aux utilisateurs authentifiés dans leur dossier
CREATE POLICY "Les utilisateurs authentifiés peuvent supprimer dans leur dossier d'organisation"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  (storage.foldername(name))[1] IN (
    SELECT organization_id::text
    FROM profiles
    WHERE id = auth.uid()
  )
);

-- Politique pour permettre la mise à jour aux utilisateurs authentifiés dans leur dossier
CREATE POLICY "Les utilisateurs authentifiés peuvent mettre à jour dans leur dossier d'organisation"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  (storage.foldername(name))[1] IN (
    SELECT organization_id::text
    FROM profiles
    WHERE id = auth.uid()
  )
);

