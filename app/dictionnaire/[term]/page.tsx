"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { LahalexHeaderResponsive } from "@/components/lahalex-header-responsive"
import { LahalexBreadcrumbResponsive } from "@/components/lahalex-breadcrumb-responsive"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ArrowLeft, Menu, X } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

import { DictionaryTerm } from "@/types/dictionary"

export default function TermDefinitionPage() {
  const params = useParams()
  const router = useRouter()
  const term = params.term as string
  const [searchValue, setSearchValue] = useState("")
  const [termData, setTermData] = useState<DictionaryTerm | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const isMobile = useIsMobile()

  useEffect(() => {
    fetchTermData()
  }, [term])

  // Fermer la sidebar mobile quand on change de terme
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }, [term, isMobile])

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

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      {/* Header mobile */}
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b border-amber-200 bg-amber-50">
          <h1 className="text-xl font-bold text-gray-900">Dictionnaire juridique</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {/* Title desktop */}
        {!isMobile && (
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Dictionnaire juridique
          </h1>
        )}
        
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
            <h2 className="text-xl font-bold text-gray-900 mb-2">{termData?.term.charAt(0).toUpperCase() || 'A'}</h2>
            <div className="space-y-1">
              <button className="block w-full text-left text-gray-700 hover:text-blue-600 hover:bg-amber-100 px-2 py-1 rounded text-sm">
                {termData?.term}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

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
          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.push("/dictionnaire")}>
              Retour
            </Button>
            <Button variant="outline" onClick={() => router.push("/")}>
              Retour à l'accueil
            </Button>
          </div>
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

      <div className="flex min-h-[calc(100vh-64px)] lg:min-h-[calc(100vh-80px)]">
        {/* Sidebar Desktop */}
        <div className="hidden lg:block w-80 xl:w-96 bg-amber-50 border-r border-amber-200">
          <SidebarContent />
        </div>



        {/* Mobile Sidebar Overlay */}
        {isMobile && sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-80 bg-amber-50 shadow-xl">
              <SidebarContent />
            </div>
          </div>
        )}

        {/* Zone principale - Définition du terme */}
        <div className="flex-1 bg-white p-4 lg:p-8 overflow-y-auto relative">
          {/* Bouton Dictionnaire mobile - juste au-dessus du titre */}
          {isMobile && (
            <div className="mb-4 flex justify-center lg:justify-start">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="shadow-lg bg-white border-amber-300"
              >
                <Menu className="w-4 h-4 mr-2" />
                Dictionnaire
              </Button>
            </div>
          )}
          
          {/* En-tête avec grande lettre */}
          <div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-8 mb-6 lg:mb-8">
            <div className="text-6xl lg:text-9xl font-bold text-gray-200 leading-none text-center lg:text-left">
              {termLetter}
            </div>
            
            <div className="flex-1">
              <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-4 lg:mb-6 text-center lg:text-left">
                {termData.term}
                {termData.grammaticalInfo && (
                  <span className="text-base lg:text-lg font-normal text-gray-500 ml-2 lg:ml-3">
                    ({termData.grammaticalInfo})
                  </span>
                )}
              </h1>
              
              {/* Définition */}
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed text-base lg:text-lg whitespace-pre-line">
                  {termData.definition}
                </p>
                
                {/* Exemples */}
                {termData.examples && termData.examples.length > 0 && (
                  <div className="mt-4 lg:mt-6">
                    {termData.examples.map((example, index) => (
                      <div key={index} className="bg-blue-50 border-l-4 border-blue-400 p-3 lg:p-4 my-3 lg:my-4">
                        <p className="text-blue-800 font-medium mb-2">🔸 Exemple :</p>
                        <p className="text-blue-700 italic text-sm lg:text-base">{example}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bouton de retour fixe en bas à gauche */}
      <div className="fixed bottom-4 left-4 lg:bottom-6 lg:left-6 z-50">
        <Button
          onClick={() => router.push("/dictionnaire")}
          className="flex items-center gap-2 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 text-sm lg:text-base px-3 py-2 lg:px-4 lg:py-2"
          style={{ backgroundColor: "#770D28" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#9a1a3a";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#770D28";
          }}
        >
          <ArrowLeft className="w-3 h-3 lg:w-4 lg:h-4" />
          <span className="hidden sm:inline">Retour</span>
          <span className="sm:hidden">Retour</span>
        </Button>
      </div>
    </div>
  )
}
