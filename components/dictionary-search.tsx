"use client"

import { useState, useEffect } from "react"
import { Search, BookOpen, Filter, X, Bookmark, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DictionaryTerm, DictionarySearchResult, DictionaryCategory } from "@/types/dictionary"

interface DictionarySearchProps {
  onTermSelect?: (term: DictionaryTerm) => void
  className?: string
}

export function DictionarySearch({ onTermSelect, className }: DictionarySearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<DictionarySearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<DictionaryCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [showFilters, setShowFilters] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Charger les catégories au montage
  useEffect(() => {
    fetchCategories()
  }, [])

  // Charger les recherches récentes depuis le localStorage
  useEffect(() => {
    const saved = localStorage.getItem("lahalex-dictionary-recent-searches")
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/dictionary/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error)
    }
  }

  const handleSearch = async (query: string = searchQuery) => {
    if (!query.trim()) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        query: query.trim(),
        ...(selectedCategory && { category: selectedCategory }),
        limit: "20"
      })

      const response = await fetch(`/api/dictionary/search?${params}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.results || [])
        
        // Sauvegarder la recherche récente
        if (query.trim()) {
          const newRecentSearches = [
            query.trim(),
            ...recentSearches.filter(s => s !== query.trim())
          ].slice(0, 5)
          setRecentSearches(newRecentSearches)
          localStorage.setItem("lahalex-dictionary-recent-searches", JSON.stringify(newRecentSearches))
        }
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
      onTermSelect(term)
    }
  }

  const clearFilters = () => {
    setSelectedCategory("")
    setSearchResults([])
  }

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category?.color || "#6B7280"
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Barre de recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Recherche dans le dictionnaire
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Rechercher un terme juridique..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4"
                />
              </div>
              <Button type="submit" disabled={loading || !searchQuery.trim()}>
                {loading ? "Recherche..." : "Rechercher"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="px-3"
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div>

            {/* Filtres */}
            {showFilters && (
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filtres</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Effacer
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Catégorie
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="">Toutes les catégories</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name} ({category.termCount})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Recherches récentes */}
      {recentSearches.length > 0 && !searchResults.length && !loading && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recherches récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery(search)
                    handleSearch(search)
                  }}
                  className="text-sm"
                >
                  {search}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résultats de recherche */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Résultats ({searchResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {searchResults.map((result) => (
                <div
                  key={result.term.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleTermClick(result.term)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {result.term.term}
                        </h3>
                        {result.term.category && (
                          <Badge
                            style={{ backgroundColor: getCategoryColor(result.term.category) }}
                            className="text-white"
                          >
                            {categories.find(c => c.id === result.term.category)?.name || result.term.category}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-700 mb-3">{result.term.definition}</p>
                      
                      {result.term.synonyms && result.term.synonyms.length > 0 && (
                        <div className="mb-2">
                          <span className="text-sm text-gray-500 mr-2">Synonymes :</span>
                          <div className="flex flex-wrap gap-1">
                            {result.term.synonyms.map((synonym, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {synonym}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {result.term.examples && result.term.examples.length > 0 && (
                        <div className="mb-2">
                          <span className="text-sm text-gray-500 mr-2">Exemples :</span>
                          <div className="space-y-1">
                            {result.term.examples.slice(0, 2).map((example, index) => (
                              <p key={index} className="text-sm text-gray-600 italic">
                                "{example}"
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-gray-700"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Ajouter aux favoris
                        }}
                      >
                        <Bookmark className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* État vide */}
      {!loading && searchQuery && searchResults.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun résultat trouvé
            </h3>
            <p className="text-gray-500">
              Aucun terme ne correspond à votre recherche "{searchQuery}".
              <br />
              Essayez avec d'autres mots-clés ou vérifiez l'orthographe.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


