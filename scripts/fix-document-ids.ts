import { promises as fs } from 'fs'
import { join } from 'path'
import { DocumentManager } from '../lib/document-manager'

const DOCUMENTS_DIR = join(process.cwd(), 'content', 'documents')

interface DocumentInfo {
  oldId: string
  newId: string
  title: string
  type: string
}

async function generateUniqueId(title: string, type: string, existingIds: Set<string>): Promise<string> {
  let baseId = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .replace(/^-|-$/g, '')
  
  baseId = `${baseId}-${type}`
  
  let finalId = baseId
  let counter = 1
  
  while (existingIds.has(finalId)) {
    finalId = `${baseId}-${counter}`
    counter++
  }
  
  return finalId
}

async function fixDocumentIds() {
  console.log('🔧 Début de la correction des IDs de documents...')
  
  try {
    // Lire tous les dossiers de documents
    const entries = await fs.readdir(DOCUMENTS_DIR, { withFileTypes: true })
    const documents: DocumentInfo[] = []
    const existingIds = new Set<string>()
    
    // Première passe : collecter tous les documents et leurs métadonnées
    for (const entry of entries) {
      if (entry.isDirectory()) {
        try {
          const metadataPath = join(DOCUMENTS_DIR, entry.name, 'metadata.json')
          const metadataContent = await fs.readFile(metadataPath, 'utf-8')
          const metadata = JSON.parse(metadataContent)
          
          documents.push({
            oldId: entry.name,
            newId: '', // Sera calculé plus tard
            title: metadata.title,
            type: metadata.type
          })
        } catch (error) {
          console.warn(`⚠️ Impossible de lire les métadonnées de ${entry.name}:`, error)
        }
      }
    }
    
    // Deuxième passe : générer de nouveaux IDs uniques
    const idMappings: Map<string, string> = new Map()
    
    for (const doc of documents) {
      const newId = await generateUniqueId(doc.title, doc.type, existingIds)
      doc.newId = newId
      existingIds.add(newId)
      idMappings.set(doc.oldId, newId)
      
      console.log(`📝 ${doc.oldId} → ${newId} (${doc.title})`)
    }
    
    // Troisième passe : renommer les dossiers
    for (const [oldId, newId] of idMappings) {
      if (oldId !== newId) {
        const oldPath = join(DOCUMENTS_DIR, oldId)
        const newPath = join(DOCUMENTS_DIR, newId)
        
        try {
          await fs.rename(oldPath, newPath)
          console.log(`✅ Renommé: ${oldId} → ${newId}`)
        } catch (error) {
          console.error(`❌ Erreur lors du renommage de ${oldId}:`, error)
        }
      }
    }
    
    console.log('🎉 Correction des IDs terminée avec succès!')
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction des IDs:', error)
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  fixDocumentIds()
}

export { fixDocumentIds }
