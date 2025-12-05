/**
 * Script pour définir directement un nouveau mot de passe pour un utilisateur
 * Utilise l'API Admin de Supabase pour contourner les problèmes d'email
 * 
 * Usage: node scripts/set-password.js <email> <nouveau-mot-de-passe>
 * 
 * Exemple: node scripts/set-password.js oumouzoune.mohamed@gmail.com MonNouveauMotDePasse123
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Erreur: Variables d\'environnement manquantes');
  console.error('Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définies dans .env.local');
  process.exit(1);
}

const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.error('❌ Usage: node scripts/set-password.js <email> <nouveau-mot-de-passe>');
  console.error('');
  console.error('Exemple:');
  console.error('  node scripts/set-password.js oumouzoune.mohamed@gmail.com MonNouveauMotDePasse123');
  process.exit(1);
}

if (newPassword.length < 6) {
  console.error('❌ Erreur: Le mot de passe doit contenir au moins 6 caractères');
  process.exit(1);
}

// Créer le client admin Supabase
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function setPassword() {
  try {
    console.log(`\n🔍 Recherche de l'utilisateur: ${email}...`);

    // Lister tous les utilisateurs
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', listError.message);
      process.exit(1);
    }

    // Trouver l'utilisateur par email
    const user = usersData.users.find((u) => u.email === email);

    if (!user) {
      console.error(`❌ Aucun utilisateur trouvé avec l'email: ${email}`);
      process.exit(1);
    }

    console.log(`✅ Utilisateur trouvé: ${user.email} (ID: ${user.id})`);

    // Définir le nouveau mot de passe
    console.log(`\n🔐 Définition du nouveau mot de passe...`);

    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        password: newPassword,
      }
    );

    if (updateError) {
      console.error('❌ Erreur lors de la définition du mot de passe:', updateError.message);
      process.exit(1);
    }

    console.log('\n✅ SUCCÈS! Le mot de passe a été défini avec succès.');
    console.log(`\n📧 Email: ${email}`);
    console.log(`🔑 Nouveau mot de passe: ${newPassword}`);
    console.log('\n⚠️  IMPORTANT: L\'utilisateur peut maintenant se connecter avec ce nouveau mot de passe.');
    console.log('   Assurez-vous de communiquer ce mot de passe de manière sécurisée.\n');
  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
    process.exit(1);
  }
}

setPassword();

