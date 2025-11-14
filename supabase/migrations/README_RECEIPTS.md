# Migrations Supabase - Bons d'entrée/sortie

## Installation des tables de mouvements

Pour activer le module de gestion des bons d'entrée/sortie, vous devez exécuter le script SQL dans votre projet Supabase.

### Étapes

1. Connectez-vous à votre projet Supabase
2. Allez dans **SQL Editor**
3. Copiez le contenu du fichier `create_receipts_tables.sql`
4. Collez-le dans l'éditeur SQL
5. Cliquez sur **Run** pour exécuter le script

### Tables créées

- **receipts** : Table principale des bons d'entrée/sortie
- **receipt_items** : Table des lignes de bon (produits concernés)

### Fonctionnalités automatiques

- **Génération automatique de référence** : Les références sont générées automatiquement (ENT-YYYY-XXXX pour les entrées, SOR-YYYY-XXXX pour les sorties)
- **Mise à jour des stocks** : Les stocks sont mis à jour automatiquement lors de la création/suppression d'un bon
- **Row Level Security (RLS)** : Les utilisateurs ne peuvent voir/modifier que les bons de leur organisation

### Types de bons

- **Entrée (entry)** : Réception de marchandises (augmente les stocks)
- **Sortie (exit)** : Retrait de stock (diminue les stocks, avec vérification de disponibilité)

### Statuts

- **completed** : Bon complété (stocks mis à jour)
- **pending** : Bon en attente
- **cancelled** : Bon annulé

### Après l'exécution

Une fois le script exécuté, vous pouvez utiliser le module Mouvements dans l'application. Les bons seront automatiquement liés à votre organisation et les stocks seront mis à jour en temps réel.

