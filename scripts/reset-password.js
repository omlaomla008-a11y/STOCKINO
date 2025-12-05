/**
 * Script pour générer un lien de réinitialisation de mot de passe
 * Usage: node scripts/reset-password.js <email>
 * 
 * Assurez-vous d'avoir les variables d'environnement suivantes:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error('❌ Erreur: Les variables NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définies.');
  console.error('\nVous pouvez les définir dans un fichier .env.local ou les passer en ligne de commande:');
  console.error('NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/reset-password.js <email>');
  process.exit(1);
}

const email = process.argv[2];

if (!email) {
  console.error('❌ Erreur: Veuillez fournir un email.');
  console.error('Usage: node scripts/reset-password.js <email>');
  process.exit(1);
}

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function generateResetLink() {
  try {
    console.log(`\n🔍 Recherche de l'utilisateur: ${email}...`);
    
    // Récupérer l'utilisateur par email
    const { data: users, error: listError } = await adminClient.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', listError.message);
      process.exit(1);
    }

    const user = users.users.find((u) => u.email === email);

    if (!user) {
      console.error(`❌ Aucun utilisateur trouvé avec l'email: ${email}`);
      process.exit(1);
    }

    console.log(`✅ Utilisateur trouvé: ${user.email} (ID: ${user.id})`);

    // Déterminer l'URL de redirection
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL || 'http://localhost:3001';
    const redirectUrl = `${siteUrl}/reset-password`;

    console.log(`\n🔗 Génération du lien de réinitialisation...`);
    console.log(`   URL de redirection: ${redirectUrl}`);

    // Générer le lien de réinitialisation
    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (linkError || !linkData) {
      console.error('❌ Erreur lors de la génération du lien:', linkError?.message || 'Erreur inconnue');
      process.exit(1);
    }

    console.log('\n✅ Lien de réinitialisation généré avec succès!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 EMAIL:', email);
    console.log('🔗 LIEN DE RÉINITIALISATION:');
    console.log(linkData.properties.action_link);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('💡 Instructions:');
    console.log('   1. Copiez le lien ci-dessus');
    console.log('   2. Envoyez-le à l\'utilisateur par email ou autre moyen sécurisé');
    console.log('   3. L\'utilisateur pourra définir un nouveau mot de passe en cliquant sur le lien\n');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
    process.exit(1);
  }
}

generateResetLink();

