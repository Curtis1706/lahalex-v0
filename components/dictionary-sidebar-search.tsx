"use client"

import { useState, useEffect } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DictionaryTerm } from "@/types/dictionary"

interface DictionarySidebarSearchProps {
  onTermSelect?: (term: string) => void
  className?: string
}

export function DictionarySidebarSearch({ onTermSelect, className }: DictionarySidebarSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<DictionaryTerm[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const handleSearch = async (query: string = searchQuery) => {
    if (!query.trim()) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams({
        query: query.trim(),
        limit: "10"
      })

      const response = await fetch(`/api/dictionary/search?${params}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.results || [])
        setShowResults(true)
      }
    } catch (error) {
      console.error("Erreur lors de la recherche:", error)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch()
  }

  const handleTermClick = (term: DictionaryTerm) => {
    if (onTermSelect) {
      onTermSelect(term.term)
    }
    setSearchQuery("")
    setShowResults(false)
  }

  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
    setShowResults(false)
  }

  return (
    <div className={`relative ${className}`}>
      {/* Barre de recherche */}
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Rechercher dans le dictionnaire"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10 bg-white border-amber-300 focus:border-amber-500"
          onFocus={() => {
            if (searchQuery.trim() && searchResults.length > 0) {
              setShowResults(true)
            }
          }}
        />
        {searchQuery && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </form>

      {/* Résultats de recherche */}
      {showResults && (searchResults.length > 0 || loading) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-500 mx-auto mb-2"></div>
              Recherche en cours...
            </div>
          ) : (
            <div className="py-2">
              {searchResults.map((result) => (
                <button
                  key={result.term.id}
                  onClick={() => handleTermClick(result.term)}
                  className="w-full text-left px-4 py-2 hover:bg-amber-50 text-sm text-gray-700 border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium">{result.term.term}</div>
                  {result.term.category && (
                    <div className="text-xs text-gray-500 mt-1">
                      {result.term.category}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* État vide */}
      {showResults && !loading && searchResults.length === 0 && searchQuery.trim() && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4 text-center text-gray-500 text-sm">
            Aucun résultat trouvé pour "{searchQuery}"
          </div>
        </div>
      )}
    </div>
  )
}

