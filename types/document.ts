export interface DocumentMetadata {
  id: string
  title: string
  type: 'constitution' | 'code' | 'loi' | 'decret' | 'other'
  description: string
  publishedDate?: string
  source?: string
  structure: DocumentStructure
}

export interface DocumentStructure {
  sections: DocumentSection[]
  totalArticles: number
}

export interface DocumentSection {
  id: string
  title: string
  type: 'livre' | 'partie' | 'titre' | 'chapitre' | 'section' | 'article'
  level: number
  order: number
  parent?: string
  children: string[]
  path: string[] // ['livre-1', 'titre-1']
}

export interface ArticleMetadata {
  id: string
  title: string
  numero: string
  document: string
  path: string[] // ['livre-1', 'titre-1']
  navigation: {
    previous?: string
    next?: string
    parent: string
  }
  versions?: Array<{
    date: string
    source: string
  }>
}

export interface ParsedDocument {
  metadata: DocumentMetadata
  articles: Array<{
    metadata: ArticleMetadata
    content: string
  }>
}