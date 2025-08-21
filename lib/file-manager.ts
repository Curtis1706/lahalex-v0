import { promises as fs } from 'fs'
import { join } from 'path'
import type { ArticleMetadata } from '@/types/article'

const CONTENT_DIR = join(process.cwd(), 'content')

export async function ensureDirectories() {
  await fs.mkdir(CONTENT_DIR, { recursive: true })
}

export async function loadArticle(slug: string): Promise<{ metadata: ArticleMetadata; content: string } | null> {
  try {
    const filePath = join(CONTENT_DIR, `${slug}.json`)
    const fileContent = await fs.readFile(filePath, 'utf-8')
    const data = JSON.parse(fileContent)
    
    return {
      metadata: data.metadata,
      content: data.content
    }
  } catch {
    return null
  }
}

export async function saveArticle(slug: string, metadata: ArticleMetadata, content: string) {
  await ensureDirectories()
  const filePath = join(CONTENT_DIR, `${slug}.json`)
  
  await fs.writeFile(filePath, JSON.stringify({
    metadata,
    content
  }, null, 2))
}

export async function listAllArticles(): Promise<string[]> {
  try {
    await ensureDirectories()
    const files = await fs.readdir(CONTENT_DIR)
    return files
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''))
  } catch {
    return []
  }
}

export async function deleteArticle(slug: string) {
  try {
    const filePath = join(CONTENT_DIR, `${slug}.json`)
    await fs.unlink(filePath)
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
  }
}

export async function articleExists(slug: string): Promise<boolean> {
  try {
    const filePath = join(CONTENT_DIR, `${slug}.json`)
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

// Fonctions de compatibilité pour les anciens imports
export async function saveMetadata(slug: string, metadata: ArticleMetadata) {
  // Cette fonction est maintenant intégrée dans saveArticle
  console.warn('saveMetadata est obsolète, utilisez saveArticle')
}

export async function saveMarkdownContent(slug: string, content: string) {
  // Cette fonction est maintenant intégrée dans saveArticle
  console.warn('saveMarkdownContent est obsolète, utilisez saveArticle')
}


