# Script de définition de mot de passe

Ce script permet de définir directement un nouveau mot de passe pour n'importe quel utilisateur, sans passer par l'email de réinitialisation.

## ⚠️ Utilisation

Ce script utilise l'API Admin de Supabase et nécessite la clé `SUPABASE_SERVICE_ROLE_KEY`.

## 📋 Prérequis

1. Avoir un fichier `.env.local` à la racine du projet avec :
   ```env
   NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
   SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
   ```

2. Installer les dépendances :
   ```bash
   npm install
   ```

## 🚀 Utilisation

```bash
node scripts/set-password.js <email> <nouveau-mot-de-passe>
```

### Exemple

```bash
node scripts/set-password.js oumouzoune.mohamed@gmail.com MonNouveauMotDePasse123
```

## ✅ Avantages

- ✅ Fonctionne même si l'email de réinitialisation ne fonctionne pas
- ✅ Le mot de passe est défini immédiatement
- ✅ Pas besoin d'être connecté en tant qu'admin dans l'application
- ✅ Solution rapide pour les cas d'urgence

## 🔒 Sécurité

- ⚠️ Ce script utilise la clé `SUPABASE_SERVICE_ROLE_KEY` qui a des privilèges élevés
- ⚠️ Ne partagez jamais ce script ou la clé avec des personnes non autorisées
- ⚠️ Utilisez ce script uniquement en local ou sur un serveur sécurisé
- ⚠️ Le mot de passe sera affiché en clair dans le terminal - soyez prudent

## 📝 Notes

- Le mot de passe doit contenir au moins 6 caractères
- L'utilisateur peut se connecter immédiatement avec le nouveau mot de passe
- Assurez-vous de communiquer le nouveau mot de passe de manière sécurisée à l'utilisateur

