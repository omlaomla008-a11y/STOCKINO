# Migrations Supabase

## Installation des tables de ventes

Pour activer le module de gestion des ventes, vous devez exécuter le script SQL dans votre projet Supabase.

### Étapes

1. Connectez-vous à votre projet Supabase
2. Allez dans **SQL Editor**
3. Copiez le contenu du fichier `create_sales_tables.sql`
4. Collez-le dans l'éditeur SQL
5. Cliquez sur **Run** pour exécuter le script

### Tables créées

- **sales** : Table principale des ventes
- **sales_items** : Table des lignes de vente (produits vendus)

### Fonctionnalités automatiques

- **Calcul automatique du total** : Le montant total de chaque vente est calculé automatiquement via un trigger
- **Mise à jour des stocks** : Les stocks sont mis à jour lors de la création/suppression d'une vente
- **Row Level Security (RLS)** : Les utilisateurs ne peuvent voir/modifier que les ventes de leur organisation

### Après l'exécution

Une fois le script exécuté, vous pouvez utiliser le module Ventes dans l'application. Les ventes seront automatiquement liées à votre organisation et les stocks seront mis à jour en temps réel.

