'use client'

import { Search, X, ChevronUp, ChevronDown } from 'lucide-react'
import { useDocumentSearch } from '@/hooks/useDocumentSearch'

interface SearchBarProps {
  className?: string
}

export function SearchBar({ className = '' }: SearchBarProps) {
  const {
    searchTerm,
    setSearchTerm,
    matches,
    currentMatchIndex,
    isSearching,
    nextMatch,
    previousMatch,
    clearSearch,
    hasMatches
  } = useDocumentSearch()

  return (
    <div className={`bg-white border border-gray-300 rounded-lg shadow-sm ${className}`}>
      <div className="flex items-center px-3 py-2">
        <Search className="w-4 h-4 text-gray-400 mr-2" />
        
        <input
          type="text"
          placeholder="Rechercher dans le document..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 outline-none text-sm"
        />

        {searchTerm && (
          <>
            {/* Compteur de résultats */}
            <div className="flex items-center text-xs text-gray-500 mr-2">
              {isSearching ? (
                <span>Recherche...</span>
              ) : hasMatches ? (
                <span>
                  {currentMatchIndex + 1} / {matches.length}
                </span>
              ) : searchTerm ? (
                <span>0 résultat</span>
              ) : null}
            </div>

            {/* Boutons de navigation */}
            {hasMatches && (
              <div className="flex items-center mr-2">
                <button
                  onClick={previousMatch}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Résultat précédent"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  onClick={nextMatch}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Résultat suivant"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Bouton effacer */}
            <button
              onClick={clearSearch}
              className="p-1 hover:bg-gray-100 rounded"
              title="Effacer la recherche"
            >
              <X className="w-3 h-3" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}