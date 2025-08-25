export interface DictionaryTerm {
  id: string
  term: string
  grammaticalInfo?: string
  definition: string
  category?: string
  synonyms?: string[]
  examples?: string[]
  relatedTerms?: string[]
  source?: string
  createdAt: string
  updatedAt: string
}

export interface DictionarySearchResult {
  term: DictionaryTerm
  relevance: number
  matchedFields: string[]
}

export interface DictionaryCategory {
  id: string
  name: string
  description?: string
  color: string
  termCount: number
}

export interface DictionarySearchFilters {
  category?: string
  source?: string
  includeSynonyms?: boolean
  includeExamples?: boolean
}

export interface DictionarySearchParams {
  query: string
  filters?: DictionarySearchFilters
  limit?: number
  offset?: number
}

