import { promises as fs } from 'fs'
import { join } from 'path'
import type { DocumentMetadata, ArticleMetadata, ParsedDocument } from '@/types/document'

const DOCUMENTS_DIR = join(process.cwd(), 'content', 'documents')

export class DocumentManager {
  static async ensureDirectories() {
    await fs.mkdir(DOCUMENTS_DIR, { recursive: true })
  }

  static async saveDocument(parsedDocument: ParsedDocument) {
    await this.ensureDirectories()
    
    console.log(`🔍 Saving document with ID: ${parsedDocument.metadata.id}`)
    
    const documentDir = join(DOCUMENTS_DIR, parsedDocument.metadata.id)
    console.log(`🔍 Document directory: ${documentDir}`)
    
    await fs.mkdir(documentDir, { recursive: true })

    // Sauvegarder les métadonnées du document
    await fs.writeFile(
      join(documentDir, 'metadata.json'),
      JSON.stringify(parsedDocument.metadata, null, 2)
    )

    // Sauvegarder chaque article
    for (const article of parsedDocument.articles) {
      console.log(`🔍 Processing article: ${article.metadata.id}`)
      console.log(`🔍 documentDir before getArticlePath: ${documentDir}`)
      console.log(`🔍 article.metadata.path: ${JSON.stringify(article.metadata.path)}`)
      
      const articlePath = this.getArticlePath(documentDir, article.metadata)
      await fs.mkdir(articlePath.dir, { recursive: true })

      // Sauvegarder le contenu markdown
      await fs.writeFile(
        join(articlePath.dir, `${article.metadata.id}.md`),
        article.content
      )

      // Sauvegarder les métadonnées de l'article
      await fs.writeFile(
        join(articlePath.dir, `${article.metadata.id}.json`),
        JSON.stringify(article.metadata, null, 2)
      )
    }
  }

  static async loadDocument(documentId: string): Promise<DocumentMetadata | null> {
    try {
      // Essayer d'abord dans le dossier principal
      const metadataPath = join(DOCUMENTS_DIR, documentId, 'metadata.json')
      const content = await fs.readFile(metadataPath, 'utf-8')
      return JSON.parse(content)
    } catch {
      // Si pas trouvé, essayer dans le dossier fiches-synthese
      try {
        const fichesDir = join(process.cwd(), 'content', 'documents', 'fiches-synthese')
        const metadataPath = join(fichesDir, documentId, 'metadata.json')
        const content = await fs.readFile(metadataPath, 'utf-8')
        return JSON.parse(content)
      } catch {
        return null
      }
    }
  }

  static async loadArticle(documentId: string, articleId: string): Promise<{ metadata: ArticleMetadata; content: string } | null> {
    try {
      const document = await this.loadDocument(documentId)
      if (!document) return null

      // Pour les fiches de méthode créées via l'admin, utiliser un seul fichier JSON
      if (document.type === 'fiche-methode') {
        try {
          // Essayer d'abord dans le dossier principal
          let articlePath = join(DOCUMENTS_DIR, documentId, `${articleId}.json`)
          let articleContent: string
          
          try {
            articleContent = await fs.readFile(articlePath, 'utf-8')
          } catch {
            // Si pas trouvé, essayer dans le dossier fiches-synthese
            const fichesDir = join(process.cwd(), 'content', 'documents', 'fiches-synthese')
            articlePath = join(fichesDir, documentId, `${articleId}.json`)
            articleContent = await fs.readFile(articlePath, 'utf-8')
          }
          
          const article = JSON.parse(articleContent)
          
          return {
            metadata: article.metadata,
            content: article.content
          }
        } catch (error) {
                     console.warn(`Impossible de charger la fiche de méthode ${articleId}:`, error)
          return null
        }
      }

      // Pour les autres documents, utiliser le système existant
      const articlePath = await this.findArticlePath(documentId, articleId)
      if (!articlePath) return null

      const [metadataContent, markdownContent] = await Promise.all([
        fs.readFile(join(articlePath, `${articleId}.json`), 'utf-8'),
        fs.readFile(join(articlePath, `${articleId}.md`), 'utf-8')
      ])

      return {
        metadata: JSON.parse(metadataContent),
        content: markdownContent
      }
    } catch {
      return null
    }
  }

  static async loadAllArticles(documentId: string): Promise<Array<{ metadata: ArticleMetadata; content: string }>> {
    try {
      const document = await this.loadDocument(documentId)
      if (!document) return []

             // Pour les fiches de méthode, charger directement l'article principal
       if (document.type === 'fiche-methode') {
        try {
          const article = await this.loadArticle(documentId, 'section-principale')
          if (article) {
            return [article]
          }
                 } catch (error) {
           console.warn(`Impossible de charger la fiche de méthode ${documentId}:`, error)
         }
        return []
      }

             // Pour les autres documents, utiliser le système existant
       let documentDir = join(DOCUMENTS_DIR, documentId)
       
       // Vérifier si le dossier existe dans le répertoire principal
       try {
         await fs.access(documentDir)
       } catch {
         // Si pas trouvé dans le répertoire principal, essayer dans fiches-synthese
         documentDir = join(process.cwd(), 'content', 'documents', 'fiches-synthese', documentId)
         try {
           await fs.access(documentDir)
         } catch {
           // Le document n'existe nulle part
           return []
         }
       }
       
       const articles: Array<{ metadata: ArticleMetadata; content: string }> = []
       
       // Fonction récursive pour parcourir tous les dossiers
       const scanDirectory = async (dir: string) => {
        try {
          const entries = await fs.readdir(dir, { withFileTypes: true })
          
          for (const entry of entries) {
            const fullPath = join(dir, entry.name)
            
            if (entry.isDirectory()) {
              // Récursivement scanner les sous-dossiers
              await scanDirectory(fullPath)
            } else if (entry.name.endsWith('.json') && !entry.name.includes('metadata')) {
              // C'est un fichier d'article (pas metadata.json)
              const articleId = entry.name.replace('.json', '')
              const markdownPath = fullPath.replace('.json', '.md')
              
              try {
                const [metadataContent, markdownContent] = await Promise.all([
                  fs.readFile(fullPath, 'utf-8'),
                  fs.readFile(markdownPath, 'utf-8')
                ])
                
                articles.push({
                  metadata: JSON.parse(metadataContent),
                  content: markdownContent
                })
              } catch (error) {
                console.warn(`Impossible de charger l'article ${articleId}:`, error)
              }
            }
          }
        } catch (error) {
          console.warn(`Impossible de scanner le dossier ${dir}:`, error)
        }
      }
      
      await scanDirectory(documentDir)
      return articles
    } catch (error) {
      console.error('Erreur lors du chargement des articles:', error)
      return []
    }
  }

  static async listDocuments(): Promise<DocumentMetadata[]> {
    try {
      await this.ensureDirectories()
      const documents = await fs.readdir(DOCUMENTS_DIR)
      const results: DocumentMetadata[] = []

      for (const docId of documents) {
        const metadata = await this.loadDocument(docId)
        if (metadata) {
          results.push(metadata)
        }
      }

      return results
    } catch {
      return []
    }
  }

  static async deleteDocument(documentId: string) {
    try {
      const documentDir = join(DOCUMENTS_DIR, documentId)
      await fs.rm(documentDir, { recursive: true, force: true })
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  private static getArticlePath(documentDir: string, metadata: ArticleMetadata) {
    console.log(`🔍 getArticlePath called with documentDir: ${documentDir}`)
    console.log(`🔍 getArticlePath called with metadata.id: ${metadata.id}`)
    console.log(`🔍 getArticlePath called with metadata.path: ${JSON.stringify(metadata.path)}`)
    
    if (!documentDir) {
      throw new Error(`Document directory is undefined for article ${metadata.id}`)
    }
    
    // Filtrer les valeurs null/undefined du path
    const pathParts = metadata.path && metadata.path.length > 0 
      ? metadata.path.filter(p => p != null) 
      : ['articles']
    
    const dir = join(documentDir, ...pathParts)
    return { dir, pathParts }
  }

     private static async findArticlePath(documentId: string, articleId: string): Promise<string | null> {
     // Essayer d'abord dans le dossier principal
     let documentDir = join(DOCUMENTS_DIR, documentId)
     
     // Vérifier si le dossier existe dans le répertoire principal
     try {
       await fs.access(documentDir)
     } catch {
       // Si pas trouvé dans le répertoire principal, essayer dans fiches-synthese
       documentDir = join(process.cwd(), 'content', 'documents', 'fiches-synthese', documentId)
       try {
         await fs.access(documentDir)
       } catch {
         // Le document n'existe nulle part
         return null
       }
     }
     
     // Recherche récursive de l'article
     const searchInDir = async (dir: string): Promise<string | null> => {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true })
        
        // Chercher le fichier JSON de l'article
        if (entries.some(entry => entry.name === `${articleId}.json`)) {
          return dir
        }

        // Chercher récursivement dans les sous-dossiers
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const result = await searchInDir(join(dir, entry.name))
            if (result) return result
          }
        }
      } catch {
        // Ignorer les erreurs de lecture
      }
      
      return null
    }

         let result = await searchInDir(documentDir)
     return result
  }

  static async listAllDocuments(): Promise<DocumentMetadata[]> {
    try {
      const documentsDir = join(process.cwd(), 'content', 'documents')
      await fs.mkdir(documentsDir, { recursive: true })
      
      const entries = await fs.readdir(documentsDir, { withFileTypes: true })
      const documents: DocumentMetadata[] = []
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          try {
            const metadataPath = join(documentsDir, entry.name, 'metadata.json')
            const metadataContent = await fs.readFile(metadataPath, 'utf-8')
            const metadata = JSON.parse(metadataContent) as DocumentMetadata
            documents.push(metadata)
          } catch (error) {
            console.warn(`Impossible de charger ${entry.name}:`, error)
          }
        }
      }
      
             // Inclure aussi les fiches de méthode créées via l'admin
      try {
        const fichesDir = join(process.cwd(), 'content', 'documents', 'fiches-synthese')
        const fichesEntries = await fs.readdir(fichesDir, { withFileTypes: true })
        
        for (const entry of fichesEntries) {
          if (entry.isDirectory()) {
            try {
              const metadataPath = join(fichesDir, entry.name, 'metadata.json')
              const metadataContent = await fs.readFile(metadataPath, 'utf-8')
              const metadata = JSON.parse(metadataContent) as DocumentMetadata
              documents.push(metadata)
            } catch (error) {
              console.warn(`Impossible de charger fiche de méthode ${entry.name}:`, error)
            }
          }
        }
      } catch (error) {
        // Le dossier fiches-synthese n'existe pas encore, c'est normal
                 console.log('Dossier fiches-methode non trouvé, ignoré')
      }
      
      return documents.sort((a, b) => 
        new Date(b.publishedDate || new Date()).getTime() - 
        new Date(a.publishedDate || new Date()).getTime()
      )
    } catch (error) {
      console.error('Erreur listAllDocuments:', error)
      return []
    }
  }
}






