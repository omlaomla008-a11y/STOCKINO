# Réinitialisation de mot de passe (Admin)

Si un utilisateur a oublié son mot de passe et que l'email de réinitialisation ne fonctionne pas, vous pouvez générer un lien de réinitialisation manuellement en tant qu'administrateur.

## Méthode 1 : Via l'interface web (Recommandé)

1. Connectez-vous à l'application en tant qu'administrateur
2. Accédez à la page : `/admin/reset-password`
3. Entrez l'email de l'utilisateur : `oumouzoune.mohamed@gmail.com`
4. Cliquez sur "Générer le lien de réinitialisation"
5. Copiez le lien généré et envoyez-le à l'utilisateur par email ou autre moyen sécurisé

## Méthode 2 : Via le script Node.js

### Prérequis

Assurez-vous d'avoir les variables d'environnement suivantes dans votre fichier `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key
```

### Utilisation

```bash
# Depuis le dossier stockino
node scripts/reset-password.js oumouzoune.mohamed@gmail.com
```

Le script va :
1. Rechercher l'utilisateur par email
2. Générer un lien de réinitialisation valide
3. Afficher le lien dans la console

### Exemple de sortie

```
🔍 Recherche de l'utilisateur: oumouzoune.mohamed@gmail.com...
✅ Utilisateur trouvé: oumouzoune.mohamed@gmail.com (ID: abc123...)

🔗 Génération du lien de réinitialisation...
   URL de redirection: https://votre-site.com/reset-password

✅ Lien de réinitialisation généré avec succès!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 EMAIL: oumouzoune.mohamed@gmail.com
🔗 LIEN DE RÉINITIALISATION:
https://votre-projet.supabase.co/auth/v1/verify?token=...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Instructions:
   1. Copiez le lien ci-dessus
   2. Envoyez-le à l'utilisateur par email ou autre moyen sécurisé
   3. L'utilisateur pourra définir un nouveau mot de passe en cliquant sur le lien
```

## Notes importantes

- ⚠️ **Sécurité** : Ne partagez jamais le lien de réinitialisation publiquement. Envoyez-le uniquement à l'utilisateur concerné par un canal sécurisé (email, SMS, etc.)
- ⏰ **Expiration** : Les liens de réinitialisation expirent généralement après 24 heures
- 🔒 **Accès admin requis** : Seuls les administrateurs peuvent utiliser ces méthodes

