# Guide de Configuration Git pour Netlify

## 🚨 Problème : "No results found" dans Netlify

Ce problème apparaît parce que le code n'a pas encore été poussé sur GitHub avec des branches.

## Solution : Initialiser Git et pousser sur GitHub

### ÉTAPE 1 : Initialiser Git

Ouvrez un terminal dans le dossier `stockino` et exécutez :

```bash
cd stockino
git init
git add .
git commit -m "Initial commit - STOCKINO ready for Netlify deployment"
```

### ÉTAPE 2 : Créer un repository sur GitHub

1. Allez sur [github.com](https://github.com)
2. Connectez-vous à votre compte
3. Cliquez sur le bouton **"+"** en haut à droite
4. Cliquez sur **"New repository"**
5. Nommez votre repository : **`stockino`**
6. Choisissez **Public** ou **Private**
7. **NE COCHEZ PAS** "Initialize with README"
8. **NE COCHEZ PAS** "Add .gitignore"
9. **NE COCHEZ PAS** "Choose a license"
10. Cliquez sur **"Create repository"**

### ÉTAPE 3 : Lier le repository local à GitHub

Une fois le repository créé sur GitHub, copiez l'URL du repository (ex: `https://github.com/VOTRE_USERNAME/stockino.git`)

Dans votre terminal, exécutez :

```bash
git remote add origin https://github.com/VOTRE_USERNAME/stockino.git
git branch -M main
git push -u origin main
```

**Note:** Remplacez `VOTRE_USERNAME` par votre nom d'utilisateur GitHub.

### ÉTAPE 4 : Retourner sur Netlify

1. Retournez sur la page de configuration Netlify
2. Cliquez sur **"Refresh"** ou **"Retry"** pour que Netlify détecte les branches
3. Le champ "Branch to deploy" devrait maintenant afficher **"main"**
4. Sélectionnez **"main"**

### ÉTAPE 5 : Remplir les autres champs

- **Base directory**: (laisser vide)
- **Build command**: `npm run build`
- **Publish directory**: (laisser vide)
- **Functions directory**: `netlify/functions` (déjà rempli)

## ⚠️ Important : Variables d'environnement

Avant de cliquer sur "Deploy site", assurez-vous d'ajouter les variables d'environnement :

1. Cliquez sur **"Show advanced"** ou cherchez **"Environment variables"**
2. Ajoutez les 3 variables :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

## 🎯 Après avoir poussé le code sur GitHub

1. Retournez sur Netlify
2. Rafraîchissez la page ou attendez quelques secondes
3. Netlify devrait maintenant détecter la branche `main`
4. Sélectionnez `main` dans "Branch to deploy"
5. Remplissez les autres champs
6. Ajoutez les variables d'environnement
7. Cliquez sur "Deploy site"

