"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { LahalexHeaderResponsive } from "@/components/lahalex-header-responsive"
import { LahalexBreadcrumbResponsive } from "@/components/lahalex-breadcrumb-responsive"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

import { DictionaryTerm } from "@/types/dictionary"

export default function TermDefinitionPage() {
  const params = useParams()
  const router = useRouter()
  const term = params.term as string
  const [searchValue, setSearchValue] = useState("")
  const [termData, setTermData] = useState<DictionaryTerm | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTermData()
  }, [term])

  const fetchTermData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Récupérer tous les termes depuis l'API
      const response = await fetch('/api/dictionary/terms')
      if (response.ok) {
        const data = await response.json()
        const terms = data.terms || []
        
        // Chercher le terme spécifique
        const foundTerm = terms.find((t: DictionaryTerm) => 
          t.term.toLowerCase() === decodeURIComponent(term).toLowerCase()
        )
        
        if (foundTerm) {
          setTermData(foundTerm)
        } else {
          setError("Terme non trouvé")
        }
      } else {
        setError("Erreur lors de la récupération des données")
      }
    } catch (error) {
      console.error("Erreur:", error)
      setError("Erreur de connexion")
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour la recherche globale depuis le header
  const handleSearchSubmit = async (query: string) => {
    if (!query.trim()) return
    window.location.href = `/?search=${encodeURIComponent(query)}`
  }

  const breadcrumbItems = [
    { label: "Accueil", href: "/" },
    { label: "Autres outils", href: "/" },
    { label: "Dictionnaire juridique", href: "/dictionnaire" },
    { label: decodeURIComponent(term), isActive: true }
  ]

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
          <p className="text-gray-600">Chargement du terme...</p>
        </div>
        
      </div>
    )
  }

  if (error || !termData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LahalexHeaderResponsive 
          searchValue={searchValue} 
          onSearchChange={setSearchValue} 
          onSearchSubmit={handleSearchSubmit} 
        />
        <LahalexBreadcrumbResponsive items={breadcrumbItems} />
        
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Terme non trouvé
          </h1>
          <p className="text-gray-600 mb-6">
            Le terme "{decodeURIComponent(term)}" n'existe pas dans notre dictionnaire.
          </p>
          <Button onClick={() => router.push("/dictionnaire")}>
            Retour au dictionnaire
          </Button>
        </div>
        
      </div>
    )
  }

  // Déterminer la lettre du terme
  const termLetter = termData.term.charAt(0).toUpperCase()

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
            />
          </div>

          {/* Navigation alphabétique simplifiée */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{termLetter}</h2>
              <div className="space-y-1">
                <button className="block w-full text-left text-gray-700 hover:text-blue-600 hover:bg-amber-100 px-2 py-1 rounded text-sm">
                  {termData.term}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Zone principale - Définition du terme */}
        <div className="flex-1 bg-white p-8 overflow-y-auto">
          {/* En-tête avec grande lettre */}
          <div className="flex items-start gap-8 mb-8">
            <div className="text-9xl font-bold text-gray-200 leading-none">
              {termLetter}
            </div>
            
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-6">
                {termData.term}
                {termData.grammaticalInfo && (
                  <span className="text-lg font-normal text-gray-500 ml-3">
                    ({termData.grammaticalInfo})
                  </span>
                )}
              </h1>
              
              {/* Définition */}
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                  {termData.definition}
                </p>
                
                {/* Exemples */}
                {termData.examples && termData.examples.length > 0 && (
                  <div className="mt-6">
                    {termData.examples.map((example, index) => (
                      <div key={index} className="bg-blue-50 border-l-4 border-blue-400 p-4 my-4">
                        <p className="text-blue-800 font-medium mb-2">🔸 Exemple :</p>
                        <p className="text-blue-700 italic">{example}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
