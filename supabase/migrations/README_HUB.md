# Tech Hub — configuration

## 1. Tables Supabase

Exécutez **`create_hub_tables.sql`** dans l’éditeur SQL Supabase (déjà fait si vous voyez les tables).

## 2. Studio public (mot de passe)

URL d’édition **sans compte Stockino** :

- **Connexion :** `https://stockino.space/studio/login`
- **Espace de travail :** `https://stockino.space/studio`

### Variables d’environnement

Ajoutez dans **`.env.local`** (local) et dans **Netlify → Environment variables** :

```env
HUB_STUDIO_PASSWORD=votre_mot_de_passe_secret_min_8_caracteres
# Optionnel (signature cookie, sinon = mot de passe) :
# HUB_STUDIO_SECRET=une_autre_chaine_longue
```

Redéployez après modification sur Netlify.

### Utilisation

1. Ouvrir `/studio/login`
2. Saisir le mot de passe défini dans `HUB_STUDIO_PASSWORD`
3. Gérer **Matériel** et **Blog** (création, modification, brouillon / publié)
4. **Déconnexion** via le bouton en haut à droite

Le cookie de session dure **7 jours**.

## 3. Premier produit (Zebra DS2208)

En local :

```bash
node scripts/seed-first-hardware.mjs
```

Ou exécutez **`supabase/seed/first_hardware_product.sql`** dans l’éditeur SQL Supabase.

Fiche : `https://stockino.space/hardware/zebra-ds2208`

## 4. Contenu public

- Publié → visible sur `/hardware` et `/blog`
- Non publié → visible uniquement dans le studio

## 5. Images

Upload via le studio → bucket Supabase **`product-images`** (dossier `hub/`).

## 6. Affiliation Amazon.fr

1. Inscrivez-vous sur [Amazon Partenaires France](https://partenaires.amazon.fr/).
2. Récupérez votre **ID de suivi** (ex. `stockino-21`).
3. Ajoutez sur **Netlify** et dans `.env.local` :

```env
AMAZON_ASSOCIATE_TAG=votretag-21
```

4. Dans le studio, collez l’URL produit Amazon **sans** le tag : il sera ajouté automatiquement à l’enregistrement et à l’affichage.

Mention légale affichée sur le site : « En tant que Partenaire Amazon… »

## 7. Google Analytics 4

1. Créez un flux Web sur [Google Analytics](https://analytics.google.com/) pour `https://stockino.space`.
2. Copiez l’**ID de mesure** (format `G-XXXXXXXXXX`).
3. Ajoutez sur **Netlify** et dans `.env.local` :

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-EHQY82PQ0F
```

4. Redéployez, puis visitez le site : le bandeau « collecte inactive » disparaît en quelques minutes (parfois jusqu’à 24–48 h).

Les pages du hub et de l’app sont mesurées ; la mesure améliorée (défilements, clics sortants) se configure dans l’interface GA4.
