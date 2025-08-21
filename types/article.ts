// Types pour la nouvelle architecture

// Define the structure of a section as it appears in the *input JSON* (nested)
export interface RawNestedSection {
  title: string;
  level: number;
  order: number;
  id?: string; // ID might be present if manually added, but often missing for nested
  children?: RawNestedSection[];
  articles?: string[]; // Array of article titles
}

export interface ArticleMetadata {
  id: string
  title: string
  slug: string
  description: string
  summary?: string
  source?: string
  sourceUrl?: string
  publishedAt: string
  category: {
    id: string
    name: string
    slug: string
    color: string
  }
  subcategories?: Array<{
    id: string
    name: string
    slug: string
    color: string
  }>
  tags: Array<{
    id: string
    name: string
    slug: string
    color: string
  }>
  // This 'sections' array is the FLAT structure expected by components
  sections: Array<{
    id: string
    title: string
    level: number
    order: number
    startIndex: number // These might not be strictly used for Markdown-based content, but keep for type consistency
    endIndex: number   // These might not be strictly used for Markdown-based content, but keep for type consistency
  }>
  author: {
    id: string
    name: string
  }
  documentType: string
  favoritesCount: number
  createdAt: string
  updatedAt: string
}

export interface ArticleContent {
  metadata: ArticleMetadata
  content: string
}
