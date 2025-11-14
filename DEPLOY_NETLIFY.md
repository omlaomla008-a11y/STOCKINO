# Guide de Déploiement sur Netlify - STOCKINO

## 📋 Prérequis

1. ✅ Un compte Netlify (gratuit sur [netlify.com](https://netlify.com))
2. ✅ Un compte GitHub, GitLab ou Bitbucket
3. ✅ Votre projet STOCKINO doit être poussé sur un repository Git
4. ✅ Les clés Supabase (URL, Anon Key, Service Role Key)

---

## ÉTAPE 1 : Préparer le projet localement

### 1.1 Vérifier que le plugin Netlify est installé

Le plugin `@netlify/plugin-nextjs` est déjà installé. Vérifiez dans `package.json` qu'il apparaît dans `devDependencies`.

### 1.2 Vérifier que le fichier `netlify.toml` existe

Le fichier `netlify.toml` a été créé à la racine du projet avec la configuration suivante :

```toml
[build]
  command = "npm run build"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "20"
```

### 1.3 Vérifier la configuration Next.js

Le fichier `next.config.ts` a été mis à jour pour utiliser `serverExternalPackages` (compatible avec Next.js 15).

---

## ÉTAPE 2 : Pousser le code sur Git

### 2.1 Initialiser Git (si pas déjà fait)

Ouvrez un terminal dans le dossier `stockino` et exécutez :

```bash
git init
git add .
git commit -m "Initial commit - Ready for Netlify deployment"
```

### 2.2 Créer un repository sur GitHub

1. Allez sur [github.com](https://github.com)
2. Cliquez sur le bouton **"+"** en haut à droite > **"New repository"**
3. Nommez votre repository (ex: `stockino`)
4. Choisissez **Public** ou **Private**
5. **NE COCHEZ PAS** "Initialize with README"
6. Cliquez sur **"Create repository"**

### 2.3 Pousser le code sur GitHub

Dans votre terminal, exécutez les commandes suivantes (remplacez `VOTRE_USERNAME` par votre nom d'utilisateur GitHub) :

```bash
git remote add origin https://github.com/VOTRE_USERNAME/stockino.git
git branch -M main
git push -u origin main
```

Si GitHub vous demande de vous authentifier, utilisez un **Personal Access Token** (pas votre mot de passe).

---

## ÉTAPE 3 : Connecter le projet à Netlify

### 3.1 Se connecter à Netlify

1. Allez sur [app.netlify.com](https://app.netlify.com)
2. Cliquez sur **"Sign up"** ou **"Log in"**
3. Choisissez **"Sign up with GitHub"** (ou GitLab/Bitbucket)
4. Autorisez Netlify à accéder à votre compte

### 3.2 Importer le projet

1. Une fois connecté, cliquez sur **"Add new site"**
2. Cliquez sur **"Import an existing project"**
3. Choisissez votre provider Git (GitHub, GitLab, ou Bitbucket)
4. Si nécessaire, autorisez Netlify à accéder à vos repositories

### 3.3 Sélectionner le repository

1. Dans la liste, sélectionnez le repository **"stockino"**
2. Netlify détectera automatiquement les paramètres de build grâce au fichier `netlify.toml`

### 3.4 Vérifier les paramètres de build

Netlify devrait détecter automatiquement :
- **Build command**: `npm run build`
- **Publish directory**: (laisser vide - le plugin Netlify gère cela)
- **Node version**: `20`

**⚠️ IMPORTANT :** Ne remplissez PAS le champ "Publish directory". Le plugin Netlify Next.js gère cela automatiquement.

---

## ÉTAPE 4 : Configurer les variables d'environnement

### 4.1 Avant de déployer, configurez les variables d'environnement

1. Sur la page de configuration du site dans Netlify, cliquez sur **"Show advanced"**
2. Cliquez sur **"New variable"** pour ajouter chaque variable :

#### Variable 1 : `NEXT_PUBLIC_SUPABASE_URL`
- **Key**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: Votre URL Supabase (ex: `https://xxxxx.supabase.co`)

#### Variable 2 : `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: Votre clé anonyme Supabase

#### Variable 3 : `SUPABASE_SERVICE_ROLE_KEY`
- **Key**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: Votre clé service role Supabase (⚠️ **SECRET** - ne jamais exposer côté client)

### 4.2 Où trouver ces valeurs dans Supabase ?

1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous et sélectionnez votre projet
3. Allez dans **"Settings"** (⚙️) > **"API"**
4. Copiez les valeurs suivantes :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API keys** > **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Project API keys** > **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

### 4.3 Ajouter les variables dans Netlify

Pour chaque variable :
1. Cliquez sur **"New variable"**
2. Entrez la **Key** (nom de la variable)
3. Entrez la **Value** (valeur de la variable)
4. Cliquez sur **"Save"**

---

## ÉTAPE 5 : Déployer

### 5.1 Lancer le déploiement

1. Une fois toutes les variables d'environnement ajoutées, cliquez sur **"Deploy site"**
2. Netlify va :
   - Cloner votre repository
   - Installer les dépendances (`npm install`)
   - Exécuter le build (`npm run build`)
   - Déployer l'application

### 5.2 Suivre le déploiement

1. Vous verrez les logs de build en temps réel
2. Attendez que le build se termine (environ 2-5 minutes)
3. Si le build réussit, vous verrez **"Published"** avec un lien vers votre site

### 5.3 Obtenir l'URL de votre site

Une fois le déploiement terminé, Netlify vous donnera une URL comme :
- `https://stockino-123456.netlify.app`
- Ou un nom personnalisé si vous l'avez configuré

---

## ÉTAPE 6 : Configurer les redirects Supabase

### 6.1 Dans Supabase Dashboard

1. Allez sur [supabase.com](https://supabase.com)
2. Sélectionnez votre projet
3. Allez dans **"Authentication"** > **"URL Configuration"**

### 6.2 Configurer les URLs

1. **Site URL**: Ajoutez votre URL Netlify
   ```
   https://votre-site.netlify.app
   ```

2. **Redirect URLs**: Ajoutez les URLs suivantes (une par ligne) :
   ```
   https://votre-site.netlify.app/**
   https://votre-site.netlify.app/signin
   https://votre-site.netlify.app/signup
   https://votre-site.netlify.app/reset-password
   ```

3. Cliquez sur **"Save"**

---

## ÉTAPE 7 : Vérifier que tout fonctionne

### 7.1 Tester l'application

1. Ouvrez l'URL Netlify de votre site
2. Testez la page de connexion
3. Testez la création d'un compte
4. Testez les fonctionnalités principales (produits, ventes, etc.)

### 7.2 Vérifier les logs

Si des erreurs apparaissent :
1. Allez dans Netlify Dashboard > Votre site > **"Site settings"**
2. Cliquez sur **"Build & deploy"** > **"Build logs"**
3. Vérifiez les erreurs dans les logs

---

## 🔧 Problèmes courants et solutions

### ❌ Build échoue avec des erreurs ESLint

**Solution**: Les erreurs ESLint peuvent être ignorées pour le déploiement en ajoutant dans `next.config.ts` :

```typescript
const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // ... reste de la config
};
```

### ❌ Erreur "Variables d'environnement manquantes"

**Solution**: Vérifiez que toutes les variables sont bien ajoutées dans Netlify Dashboard > Site settings > Environment variables

### ❌ Erreur Supabase "Invalid API key"

**Solution**: 
- Vérifiez que les clés sont correctes
- Vérifiez que les URLs de redirect sont configurées dans Supabase

### ❌ Erreur "Page not found" sur certaines routes

**Solution**: 
- Vérifiez que le plugin `@netlify/plugin-nextjs` est installé
- Vérifiez que `netlify.toml` est à la racine du projet

### ❌ Le build prend trop de temps

**Solution**: 
- Vérifiez les logs pour identifier les étapes lentes
- Assurez-vous que `node_modules` est dans `.gitignore`

---

## 🎯 Personnaliser le domaine (Optionnel)

### 7.1 Ajouter un domaine personnalisé

1. Allez dans Netlify Dashboard > Votre site > **"Site settings"**
2. Cliquez sur **"Domain management"**
3. Cliquez sur **"Add custom domain"**
4. Suivez les instructions pour configurer votre domaine

---

## 📝 Checklist de déploiement

- [ ] Plugin Netlify Next.js installé
- [ ] Fichier `netlify.toml` créé
- [ ] Code poussé sur GitHub/GitLab/Bitbucket
- [ ] Site connecté à Netlify
- [ ] Variables d'environnement configurées :
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Déploiement réussi
- [ ] URLs de redirect configurées dans Supabase
- [ ] Application testée et fonctionnelle

---

## 🆘 Support

Si vous rencontrez des problèmes :

1. **Vérifiez les logs de build** dans Netlify Dashboard
2. **Vérifiez la console du navigateur** pour les erreurs JavaScript
3. **Consultez la documentation Netlify** : [docs.netlify.com](https://docs.netlify.com)
4. **Consultez la documentation Next.js** : [nextjs.org/docs](https://nextjs.org/docs)

---

## 🎉 Félicitations !

Votre application STOCKINO est maintenant déployée sur Netlify ! 🚀
