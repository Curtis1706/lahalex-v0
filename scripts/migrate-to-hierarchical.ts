import { promises as fs } from 'fs'
import { join } from 'path'
import { DocumentParser } from '@/lib/document-parser'
import { DocumentManager } from '@/lib/document-manager'

async function migrateToHierarchical() {
  console.log("🚀 Migration vers structure hiérarchique...")

  try {
    const contentDir = join(process.cwd(), 'content')
    const oldMetadataDir = join(contentDir, 'metadata')
    const oldMarkdownDir = join(contentDir, 'markdown')

    // Vérifier si les anciens dossiers existent
    const [metadataExists, markdownExists] = await Promise.all([
      fs.access(oldMetadataDir).then(() => true).catch(() => false),
      fs.access(oldMarkdownDir).then(() => true).catch(() => false)
    ])

    if (!metadataExists || !markdownExists) {
      console.log("❌ Dossiers metadata/ et markdown/ non trouvés")
      return
    }

    // Lire tous les fichiers existants
    const [metadataFiles, markdownFiles] = await Promise.all([
      fs.readdir(oldMetadataDir),
      fs.readdir(oldMarkdownDir)
    ])

    const jsonFiles = metadataFiles.filter(f => f.endsWith('.json'))
    const mdFiles = markdownFiles.filter(f => f.endsWith('.md'))

    console.log(`📁 Trouvé ${jsonFiles.length} fichiers JSON et ${mdFiles.length} fichiers MD`)

    let migratedCount = 0

    for (const jsonFile of jsonFiles) {
      const baseName = jsonFile.replace('.json', '')
      const correspondingMd = `${baseName}.md`

      if (!mdFiles.includes(correspondingMd)) {
        console.log(`⚠️  Pas de fichier MD correspondant pour ${jsonFile}`)
        continue
      }

      try {
        // Lire les fichiers existants
        const [oldMetadata, markdownContent] = await Promise.all([
          fs.readFile(join(oldMetadataDir, jsonFile), 'utf-8'),
          fs.readFile(join(oldMarkdownDir, correspondingMd), 'utf-8')
        ])

        const metadata = JSON.parse(oldMetadata)
        
        // Parser le document avec le nouveau système
        const parsedDocument = DocumentParser.parseDocument(
          markdownContent,
          metadata.slug || baseName,
          metadata.title
        )

        // Enrichir avec les métadonnées existantes
        parsedDocument.metadata.description = metadata.description || parsedDocument.metadata.description
        parsedDocument.metadata.publishedDate = metadata.publishedAt
        parsedDocument.metadata.source = metadata.source

        // Sauvegarder dans la nouvelle structure
        await DocumentManager.saveDocument(parsedDocument)

        console.log(`✅ Migré: ${metadata.title} (${parsedDocument.articles.length} articles)`)
        migratedCount++

      } catch (error) {
        console.error(`❌ Erreur migration ${jsonFile}:`, error)
      }
    }

    console.log(`\n🎉 Migration terminée !`)
    console.log(`📊 ${migratedCount} documents migrés`)
    console.log(`📁 Nouvelle structure dans: content/documents/`)
    
    // Créer un fichier README pour la nouvelle structure
    const readmeContent = `# Structure hiérarchique LAHALEX

## Organisation
- \`documents/[document-id]/\` : Chaque document a son dossier
- \`metadata.json\` : Métadonnées générales du document
- Structure hiérarchique automatique basée sur le contenu

## Navigation
- Chaque article a son propre fichier et URL
- Navigation arborescente automatique
- Liens précédent/suivant générés automatiquement

## Exemples d'URLs
- \`/documents/constitution-benin\` - Vue d'ensemble
- \`/documents/constitution-benin/titre-1/article-1\` - Article spécifique

Migré automatiquement le ${new Date().toLocaleDateString('fr-FR')}
`

    await fs.writeFile(join(contentDir, 'documents', 'README.md'), readmeContent)

  } catch (error) {
    console.error("❌ Erreur lors de la migration:", error)
  }
}

// Exécuter la migration
migrateToHierarchical()