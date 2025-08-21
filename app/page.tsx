"use client"
import { useState, useEffect } from "react"
import { LahalexHeaderResponsive } from "@/components/lahalex-header-responsive"
import { useIsMobile } from "@/hooks/use-mobile"
import Link from "next/link"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Menu, X, ChevronRight, FileText, Clock, BookOpen, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Footer } from "@/components/footer"

interface Document {
  id: string
  title: string
  subject: string
  document_type: string
  filename: string
  created_at: string
  estimated_reading_time: number
  num_pages: number
}

interface CategoryCounts {
  [key: string]: number
}

const ITEMS_PER_PAGE = 12

export default function HomePage() {
  const [searchValue, setSearchValue] = useState("")
  const [documents, setDocuments] = useState<Document[]>([])
  const [categoryCounts, setCategoryCounts] = useState<CategoryCounts>({})
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedSource, setSelectedSource] = useState<string>("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const isMobile = useIsMobile()

  // Pagination
  const totalPages = Math.ceil(documents.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentDocuments = documents.slice(startIndex, endIndex)

  // Reset pagination when category changes
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, selectedSource])

  // Fermer la sidebar mobile quand on sélectionne une catégorie
  useEffect(() => {
    if (isMobile && selectedCategory) {
      setSidebarOpen(false)
    }
  }, [selectedCategory, isMobile])

  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        const response = await fetch("/api/documents/categories-count")
        const data = await response.json()
        if (data.success) {
          setCategoryCounts(data.counts)
        }
      } catch (error) {
        console.error("Erreur lors du chargement des compteurs:", error)
      }
    }

    fetchCategoryCounts()
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      const fetchDocuments = async () => {
        setLoading(true)
        try {
          const params = new URLSearchParams({
            category: selectedCategory,
            ...(selectedSource && { source: selectedSource }),
          })

          const response = await fetch(`/api/documents/by-category?${params}`)
          const data = await response.json()

          if (data.success) {
            setDocuments(data.documents)
          }
        } catch (error) {
          console.error("Erreur lors du chargement des documents:", error)
        } finally {
          setLoading(false)
        }
      }

      fetchDocuments()
    }
  }, [selectedCategory, selectedSource])

  const handleCategoryClick = (category: string, source = "") => {
    setSelectedCategory(category)
    setSelectedSource(source)
  }

  const getCategoryTitle = () => {
    const categoryTitles: { [key: string]: string } = {
      "textes-constitutionnels": "Textes constitutionnels et fondamentaux",
      codes: "Codes",
      "conventions-collectives": "Conventions collectives",
      "lois-organiques": "Lois organiques",
      "lois-ordinaires": "Lois ordinaires",
      decrets: "Décrets",
      arretes: "Arrêtés",
      ohada: "OHADA",
      "union-africaine": "Union Africaine",
      cemac: "CEMAC",
      ceeac: "CEEAC",
      cedeao: "CEDEAO",
      "conventions-internationales": "Conventions internationales",
    }

    return categoryTitles[selectedCategory] || selectedCategory
  }

  const categories = [
    { key: "textes-constitutionnels", label: "Textes constitutionnels et fondamentaux", icon: FileText },
    { key: "codes", label: "Codes", icon: BookOpen },
    { key: "conventions-collectives", label: "Conventions collectives", icon: FileText },
    { key: "lois-organiques", label: "Lois organiques", icon: FileText },
    { key: "lois-ordinaires", label: "Lois ordinaires", icon: FileText },
  ]

  const internationalCategories = [
    { key: "ohada", label: "OHADA", icon: FileText },
    { key: "union-africaine", label: "Union Africaine", icon: FileText },
    { key: "cemac", label: "CEMAC", icon: FileText },
    { key: "ceeac", label: "CEEAC", icon: FileText },
    { key: "cedeao", label: "CEDEAO", icon: FileText },
    { key: "conventions-internationales", label: "Conventions internationales", icon: FileText },
    { key: "uemoa", label: "UEMOA", icon: FileText },
  ]

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      {/* Header mobile */}
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <h1 className="text-xl font-bold text-gray-900">Textes</h1>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-6 lg:mb-8">Textes</h1>
        )}

        {/* Source nationale */}
        <div className="mb-6 lg:mb-8">
          <h2 className="text-base lg:text-lg font-semibold text-gray-800 mb-3 lg:mb-4">
            Source nationale
          </h2>
          <div className="space-y-1 lg:space-y-2">
            {categories.map((category) => {
              const IconComponent = category.icon
              const count = categoryCounts[category.key] || 0
              return (
                <button
                  key={category.key}
                  onClick={() => handleCategoryClick(category.key, "nationale")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 lg:py-2 rounded-md text-sm transition-all duration-200 ${
                    selectedCategory === category.key
                      ? "bg-blue-100 text-blue-700 shadow-sm"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center space-x-2 lg:space-x-3 min-w-0">
                    <span className="truncate text-left">{category.label}</span>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {count > 0 && (
                      <Badge variant="secondary" className="text-xs px-2 py-0.5">
                        {count}
                      </Badge>
                    )}
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Liens vers autres sources */}
        <div>
          <h2 className="text-base lg:text-lg font-semibold text-gray-800 mb-3 lg:mb-4">
            Autres sources
          </h2>
          <div className="space-y-1 lg:space-y-2">
            <Link
              href="/source-regional"
              className="w-full flex items-center justify-between px-3 py-2.5 lg:py-2 rounded-md text-sm transition-all duration-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <div className="flex items-center space-x-2 lg:space-x-3 min-w-0">
                <span className="truncate text-left">Source régionale</span>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>
            <Link
              href="/source-international"
              className="w-full flex items-center justify-between px-3 py-2.5 lg:py-2 rounded-md text-sm transition-all duration-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <div className="flex items-center space-x-2 lg:space-x-3 min-w-0">
                <span className="truncate text-left">Source internationale</span>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )

  const PaginationControls = () => {
    if (totalPages <= 1) return null

    const getPageNumbers = () => {
      const pages = []
      const maxVisible = 5
      
      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        if (currentPage <= 3) {
          pages.push(1, 2, 3, 4, '...', totalPages)
        } else if (currentPage >= totalPages - 2) {
          pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
        } else {
          pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
        }
      }
      
      return pages
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="flex items-center"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Précédent
        </Button>

        <div className="flex items-center space-x-1">
          {getPageNumbers().map((page, index) => (
            <div key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-gray-500">...</span>
              ) : (
                <Button
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page as number)}
                  className="w-10 h-10"
                >
                  {page}
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="flex items-center"
        >
          Suivant
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <LahalexHeaderResponsive searchValue={searchValue} onSearchChange={setSearchValue} />

      <div className="flex min-h-[calc(100vh-64px)] lg:min-h-[calc(100vh-80px)]">
        {/* Sidebar Desktop */}
        <div className="hidden lg:block w-80 xl:w-96 bg-gray-50 border-r border-gray-200">
          <SidebarContent />
        </div>

        {/* Mobile Menu Button */}
        {isMobile && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="fixed bottom-4 left-4 z-40 shadow-lg bg-white border-gray-300"
          >
            <Menu className="w-4 h-4 mr-2" />
            Catégories
          </Button>
        )}

        {/* Mobile Sidebar Overlay */}
        {isMobile && sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl">
              <SidebarContent />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {selectedCategory ? (
            <div className="h-full flex flex-col">
              {/* Header avec titre et breadcrumb */}
              <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 lg:py-6">
                <div className="flex flex-col space-y-2 lg:space-y-3">
                  <div className="flex items-center text-sm text-gray-500">
                    <span>Textes</span>
                    <ChevronRight className="w-4 h-4 mx-2" />
                    <span className="text-gray-900 font-medium">{getCategoryTitle()}</span>
                  </div>
                  <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">
                    {getCategoryTitle()}
                  </h1>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-500">Chargement des documents...</p>
                    </div>
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-2">Aucun document trouvé</p>
                    <p className="text-gray-400 text-sm">
                      Aucun document n'est disponible pour cette catégorie.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6 lg:space-y-8">

                    {/* Documents Timeline (vertical list, no cards) */}
                    <div className="relative">
                      <div className="absolute left-6 lg:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#770D28] via-[#770D28] to-[#770D28]"></div>

                      <ul className="space-y-6">
                        {currentDocuments.map((document) => (
                          <li key={document.id} className="relative pl-14 lg:pl-16">
                            <span className="absolute left-6 lg:left-8 top-2 -translate-x-1/2">
                              <span className="block w-3.5 h-3.5 bg-[#770D28] rounded-full ring-4 ring-[#770D28]/20"></span>
                            </span>
                            <Link href={`/documents/${document.id}`} className="text-base lg:text-lg font-semibold text-gray-900 hover:text-[#770D28]">
                              {document.title}
                            </Link>
                            {document.subject && (
                              <p className="text-sm text-gray-600 mt-1">{document.subject}</p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Pagination */}
                    <PaginationControls />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full p-4 lg:p-6">
              <div className="text-center max-w-md">
                <FileText className="w-16 h-16 lg:w-20 lg:h-20 text-gray-400 mx-auto mb-6" />
                <h2 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-4">
                  Bienvenue sur LAHALEX
                </h2>
                <p className="text-gray-600 text-base lg:text-lg mb-6">
                  Sélectionnez une catégorie {isMobile ? "en appuyant sur le bouton Catégories" : "dans le menu de gauche"} pour voir les documents disponibles.
                </p>
                {isMobile && (
                  <Button
                    onClick={() => setSidebarOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Menu className="w-4 h-4 mr-2" />
                    Voir les catégories
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
