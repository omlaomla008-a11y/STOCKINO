# Configuration Supabase Storage pour les images de produits

## Problème

Lors de l'ajout d'un produit avec une image, vous recevez l'erreur :
> "Impossible de téléverser l'image pour l'instant. Vérifiez vos droits Supabase Storage."

## Solution

Deux options sont disponibles :

### Option 1 : Créer le bucket et les politiques (Recommandé pour production)

1. **Via l'interface Supabase :**
   - Allez sur [supabase.com](https://supabase.com)
   - Sélectionnez votre projet
   - Allez dans **Storage** dans le menu de gauche
   - Cliquez sur **"New bucket"**
   - Nom : `product-images`
   - Cocher **"Public bucket"**
   - Cliquez sur **"Create bucket"**

2. **Créer les politiques via SQL :**
   - Allez dans **SQL Editor** dans Supabase
   - Exécutez le fichier `create_storage_bucket.sql`

### Option 2 : Utiliser uniquement la Server Action (Fonctionne déjà)

Le code utilise maintenant une Server Action qui contourne les problèmes de permissions. 
Si le bucket n'existe pas, créez-le via l'interface Supabase comme indiqué dans l'Option 1.

## Vérification

Après avoir créé le bucket, testez l'ajout d'un produit avec une image. Cela devrait fonctionner.

## Note

Les images sont organisées par organisation : `{organization_id}/{timestamp}-{filename}`

