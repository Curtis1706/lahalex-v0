import { promises as fs } from 'fs'
import { join } from 'path'

// Script pour migrer vers le nouveau système de fichiers
async function migrateToFileSystem() {
  console.log("🚀 Migration vers le système de fichiers...")

  try {
    // 1. Créer les dossiers nécessaires
    const contentDir = join(process.cwd(), 'content')
    const metadataDir = join(contentDir, 'metadata')
    const markdownDir = join(contentDir, 'markdown') // Changed from textsDir

    await fs.mkdir(contentDir, { recursive: true })
    await fs.mkdir(metadataDir, { recursive: true })
    await fs.mkdir(markdownDir, { recursive: true }) // Changed directory

    console.log("✅ Dossiers créés :", { contentDir, metadataDir, markdownDir }) // Changed directory

    // 2. Créer un fichier README pour expliquer la structure
    const readmeContent = `# Structure des fichiers LAHALEX

## Organisation
- \`metadata/\` : Fichiers JSON contenant les métadonnées des articles
- \`markdown/\` : Fichiers Markdown (.md) contenant le contenu des articles

## Format des métadonnées (JSON)
Chaque fichier JSON doit contenir :
- id, title, slug, description
- category, subcategories, tags
- sections avec startIndex/endIndex (ces index ne sont plus utilisés pour le rendu HTML direct, mais peuvent servir pour des outils d'analyse ou de validation)
- author, publishedAt, etc.

## Format du contenu (Markdown)
Fichier Markdown brut qui sera transformé en HTML avec ancres automatiques.
Utilisez les titres Markdown (#, ##, ###, etc.) pour définir les sections. Les titres doivent correspondre aux titres définis dans les métadonnées pour que les ancres soient correctement injectées.

## Exemple
- \`metadata/mon-article.json\` ← Métadonnées
- \`markdown/mon-article.md\` ← Contenu Markdown
- URL finale : \`/article/mon-article\`
`

    await fs.writeFile(join(contentDir, 'README.md'), readmeContent, 'utf-8')

    console.log("✅ Migration terminée avec succès !")
    console.log("📁 Vous pouvez maintenant ajouter vos fichiers dans :")
    console.log("   - content/metadata/ (fichiers .json)")
    console.log("   - content/markdown/ (fichiers .md)") // Changed directory

  } catch (error) {
    console.error("❌ Erreur lors de la migration :", error)
  }
}

// Exécuter la migration
migrateToFileSystem()
