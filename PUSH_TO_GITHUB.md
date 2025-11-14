# Commandes pour pousser le code sur GitHub

## Étape 1 : Copier l'URL de ton repository GitHub

1. Va sur ton repository GitHub (celui que tu viens de créer)
2. Clique sur le bouton vert **"Code"**
3. Copie l'URL (ex: `https://github.com/TON_USERNAME/stockino.git`)

## Étape 2 : Exécuter ces commandes dans PowerShell

Remplace `https://github.com/TON_USERNAME/stockino.git` par ton URL :

```bash
cd "C:\Users\career center 1\Desktop\apps\APP STOCK\stockino"
git remote add origin https://github.com/TON_USERNAME/stockino.git
git branch -M main
git push -u origin main
```

## ⚠️ Si GitHub te demande un mot de passe

GitHub n'accepte plus les mots de passe. Tu dois utiliser un **Personal Access Token** :

1. Va sur GitHub > Settings > Developer settings > Personal access tokens > Tokens (classic)
2. Clique sur "Generate new token (classic)"
3. Donne-lui un nom (ex: "stockino-netlify")
4. Coche les cases : `repo` (toutes)
5. Clique sur "Generate token"
6. **COPIE LE TOKEN** (tu ne pourras plus le voir après)
7. Utilise ce token comme mot de passe quand Git te le demande

