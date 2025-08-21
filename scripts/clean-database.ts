import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function cleanDatabase() {
  console.log("🧹 Nettoyage de la base de données...")

  try {
    // Supprimer toutes les anciennes tables
    await prisma.$executeRaw`DROP TABLE IF EXISTS "article_sections" CASCADE;`
    await prisma.$executeRaw`DROP TABLE IF EXISTS "processing_jobs" CASCADE;`
    await prisma.$executeRaw`DROP TABLE IF EXISTS "_ArticleTags" CASCADE;`
    await prisma.$executeRaw`DROP TABLE IF EXISTS "articles" CASCADE;`
    await prisma.$executeRaw`DROP TABLE IF EXISTS "tags" CASCADE;`
    await prisma.$executeRaw`DROP TABLE IF EXISTS "categories" CASCADE;`
    
    console.log("✅ Anciennes tables supprimées")

    // Nettoyer les favoris (ils référencent maintenant des slugs)
    await prisma.favorite.deleteMany({})
    console.log("✅ Favoris nettoyés")

    console.log("🎉 Base de données nettoyée avec succès !")
    console.log("📊 Il ne reste que : users + favorites")

  } catch (error) {
    console.error("❌ Erreur lors du nettoyage:", error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanDatabase()
