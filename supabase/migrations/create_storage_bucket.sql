-- Créer le bucket pour les images de produits
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

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

