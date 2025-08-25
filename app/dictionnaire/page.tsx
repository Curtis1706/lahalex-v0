"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LahalexHeaderResponsive } from "@/components/lahalex-header-responsive"
import { LahalexBreadcrumbResponsive } from "@/components/lahalex-breadcrumb-responsive"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react"
import { Footer } from "@/components/footer"
import { DictionaryTerm } from "@/types/dictionary"

export default function DictionaryPage() {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages] = useState(77)
  const [selectedLetter, setSelectedLetter] = useState("A")
  const [terms, setTerms] = useState<DictionaryTerm[]>([])
  const [loading, setLoading] = useState(true)
  const [filteredTerms, setFilteredTerms] = useState<DictionaryTerm[]>([])

  useEffect(() => {
    fetchTerms()
  }, [])

  useEffect(() => {
    // Filtrer les termes par lettre sélectionnée
    const filtered = terms.filter(term => 
      term.term.charAt(0).toUpperCase() === selectedLetter
    )
    setFilteredTerms(filtered)
  }, [selectedLetter, terms])

  const fetchTerms = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dictionary/terms')
      if (response.ok) {
        const data = await response.json()
        setTerms(data.terms || [])
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des termes:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour la recherche globale depuis le header
  const handleSearchSubmit = async (query: string) => {
    if (!query.trim()) return
    window.location.href = `/?search=${encodeURIComponent(query)}`
  }

  // Fonction pour la recherche dans la sidebar
  const handleSidebarSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredTerms(terms.filter(term => 
        term.term.charAt(0).toUpperCase() === selectedLetter
      ))
      return
    }

    const searchLower = query.toLowerCase()
    const filtered = terms.filter(term => {
      const termLower = term.term.toLowerCase()
      const definitionLower = term.definition.toLowerCase()
      
      return termLower.includes(searchLower) || 
             definitionLower.includes(searchLower) ||
             term.synonyms?.some(synonym => synonym.toLowerCase().includes(searchLower)) ||
             term.examples?.some(example => example.toLowerCase().includes(searchLower))
    })
    setFilteredTerms(filtered)
  }

  const handleTermSelect = (term: DictionaryTerm) => {
    router.push(`/dictionnaire/${encodeURIComponent(term.term)}`)
  }

  const breadcrumbItems = [
    { label: "Accueil", href: "/" },
    { label: "Dictionnaire", isActive: true }
  ]

  // Générer l'alphabet
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LahalexHeaderResponsive 
          searchValue={searchValue} 
          onSearchChange={setSearchValue} 
          onSearchSubmit={handleSearchSubmit} 
        />
        <LahalexBreadcrumbResponsive items={breadcrumbItems} />
        
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du dictionnaire...</p>
        </div>
        
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LahalexHeaderResponsive 
        searchValue={searchValue} 
        onSearchChange={setSearchValue} 
        onSearchSubmit={handleSearchSubmit} 
      />
      <LahalexBreadcrumbResponsive items={breadcrumbItems} />

      <div className="flex h-screen">
        {/* Sidebar gauche - Navigation alphabétique */}
        <div className="w-80 bg-amber-50 border-r border-amber-200 p-6 overflow-y-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Dictionnaire juridique
          </h1>
          
          {/* Barre de recherche dans la sidebar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Rechercher dans le dictionnaire"
              className="pl-10 pr-4 bg-white border-amber-300 focus:border-amber-500"
              onChange={(e) => handleSidebarSearch(e.target.value)}
            />
          </div>

          {/* Navigation alphabétique */}
          <div className="space-y-4">
            {alphabet.map(letter => (
              <div key={letter}>
                <button
                  onClick={() => setSelectedLetter(letter)}
                  className={`text-xl font-bold text-gray-900 mb-2 w-full text-left hover:text-blue-600 ${
                    selectedLetter === letter ? 'text-blue-600' : ''
                  }`}
                >
                  {letter}
                </button>
                
                {selectedLetter === letter && (
                  <div className="space-y-1 ml-4">
                    {filteredTerms.slice(0, 20).map((term, index) => (
                      <button
                        key={term.id}
                        onClick={() => handleTermSelect(term)}
                        className="block w-full text-left text-gray-700 hover:text-blue-600 hover:bg-amber-100 px-2 py-1 rounded text-sm"
                      >
                        {term.term}
                      </button>
                    ))}
                    
                    {filteredTerms.length > 20 && (
                      <button className="block w-full text-left text-blue-600 hover:text-blue-800 px-2 py-1 rounded text-sm font-medium">
                        Voir plus...
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Zone principale - Affichage des termes */}
        <div className="flex-1 bg-white p-8 overflow-y-auto">
          {/* En-tête avec grande lettre */}
          <div className="flex items-start gap-8 mb-8">
            <div className="text-9xl font-bold text-gray-200 leading-none">
              {selectedLetter}
            </div>
            
            <div className="flex-1">
              {/* Affichage des termes de la lettre sélectionnée */}
              {filteredTerms.length > 0 ? (
                <div className="space-y-8">
                  {filteredTerms.map((term, index) => (
                    <div key={term.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                      <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        {term.term}
                        {term.grammaticalInfo && (
                          <span className="text-lg font-normal text-gray-500 ml-3">
                            ({term.grammaticalInfo})
                          </span>
                        )}
                      </h2>
                      
                      {/* Définition */}
                      <div className="prose max-w-none">
                        <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line">
                          {term.definition}
                        </p>
                        
                        {term.source && (
                          <p className="text-sm text-gray-500 mt-3 italic">
                            Source : {term.source}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    Aucun terme trouvé pour la lettre "{selectedLetter}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-700 text-white px-6 py-2 rounded-full flex items-center gap-4">
              <button className="hover:text-gray-300">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-medium">{currentPage} / {totalPages}</span>
              <button className="hover:text-gray-300">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Bouton retour en haut */}
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              size="sm"
              className="bg-gray-700 text-white border-gray-700 hover:bg-gray-800"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Restart
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

