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

## 3. Contenu public

- Publié → visible sur `/hardware` et `/blog`
- Non publié → visible uniquement dans le studio

## 4. Images

Upload via le studio → bucket Supabase **`product-images`** (dossier `hub/`).
