import { execSync } from 'child_process'
import { promises as fs } from 'fs'
import { join } from 'path'

async function setup() {
  console.log("🚀 Configuration LAHALEX - Structure hiérarchique")

  try {
    // 1. Générer le client Prisma
    console.log("📦 Génération du client Prisma...")
    execSync('npx prisma generate', { stdio: 'inherit' })

    // 2. Pousser le schéma vers la base de données
    console.log("🗄️ Mise à jour de la base de données...")
    execSync('npx prisma db push', { stdio: 'inherit' })

    // 3. Créer la structure de fichiers
    console.log("📁 Création de la structure hiérarchique...")
    const contentDir = join(process.cwd(), 'content')
    const documentsDir = join(contentDir, 'documents')
    
    await fs.mkdir(documentsDir, { recursive: true })

    // 4. Migrer les documents existants si ils existent
    try {
      console.log("🔄 Migration des documents existants...")
      execSync('npx tsx scripts/migrate-to-hierarchical.ts', { stdio: 'inherit' })
    } catch (error) {
      console.log("ℹ️  Pas de documents existants à migrer")
    }

    console.log("✅ Configuration terminée !")
    console.log("\n🎉 Votre projet LAHALEX est prêt avec la structure hiérarchique !")
    console.log("\n📋 Prochaines étapes :")
    console.log("1. Démarrer le serveur : npm run dev")
    console.log("2. Aller sur /documents pour voir la nouvelle structure")
    console.log("3. Aller sur /admin pour uploader de nouveaux documents")
    console.log("4. Les documents seront automatiquement parsés en articles individuels")
    console.log("\n🔗 URLs importantes :")
    console.log("- /documents - Liste des documents")
    console.log("- /documents/[id] - Vue d'ensemble d'un document")
    console.log("- /documents/[id]/[article] - Article spécifique")
    console.log("- /admin - Interface d'administration")

  } catch (error) {
    console.error("❌ Erreur lors de la configuration:", error)
    process.exit(1)
  }
}

setup()

