# Solution définitive pour l'upload d'images

## Problème
L'upload d'images ne fonctionne pas malgré l'utilisation du client admin (service role).

## Solution

### Option 1 : Simplifier les politiques (RECOMMANDÉ)

Si le bucket est **public**, vous pouvez supprimer toutes les politiques RLS et permettre l'upload libre :

1. Allez dans Supabase > Storage > Policies
2. Supprimez toutes les politiques pour le bucket `product-images`
3. Le bucket étant public, les fichiers seront accessibles à tous

### Option 2 : Utiliser une politique simple pour le service role

Exécutez ce SQL dans le SQL Editor de Supabase :

```sql
-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent uploader dans leur dossier d'organisation" ON storage.objects;
DROP POLICY IF EXISTS "Lecture publique des images de produits" ON storage.objects;
DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent supprimer dans leur dossier d'organisation" ON storage.objects;
DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent mettre à jour dans leur dossier d'organisation" ON storage.objects;

-- Politique simple : permettre l'upload à tous les utilisateurs authentifiés
CREATE POLICY "Allow authenticated uploads to product-images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Politique pour la lecture publique
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
```

### Option 3 : Vérifier que le bucket est public

1. Allez dans Supabase > Storage > Buckets
2. Cliquez sur `product-images`
3. Vérifiez que **"Public bucket"** est coché
4. Si ce n'est pas le cas, cochez-le et sauvegardez

### Option 4 : Test manuel dans Supabase

Pour vérifier que le bucket fonctionne :

1. Allez dans Supabase > Storage > `product-images`
2. Cliquez sur "Upload file"
3. Essayez d'uploader une image manuellement
4. Si cela fonctionne, le problème vient du code
5. Si cela ne fonctionne pas, le problème vient de la configuration du bucket

## Note importante

Le client admin (service role) **bypass complètement RLS**, donc normalement les politiques ne devraient pas bloquer l'upload. Si le problème persiste, c'est probablement :

1. Le bucket n'existe pas vraiment
2. Le service role key n'est pas correctement configuré
3. Il y a un problème de réseau/connectivité

## Vérification

Après avoir appliqué une des solutions ci-dessus :

1. Redémarre le serveur (si local)
2. Essaie d'ajouter un produit avec une image
3. Vérifie les logs du serveur pour voir l'erreur exacte

