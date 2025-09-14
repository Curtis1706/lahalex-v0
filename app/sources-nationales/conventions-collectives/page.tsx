"use client"
import { useState, useEffect } from "react"
import { LahalexHeaderResponsive } from "@/components/lahalex-header-responsive"
import { LahalexBreadcrumbResponsive } from "@/components/lahalex-breadcrumb-responsive"
import { useIsMobile } from "@/hooks/use-mobile"
import Link from "next/link"
import { ChevronRight, FileText, ChevronLeft, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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

const ITEMS_PER_PAGE = 12

export default function ConventionsCollectivesPage() {
  const [searchValue, setSearchValue] = useState("")
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const isMobile = useIsMobile()

  const totalPages = Math.ceil(documents.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentDocuments = documents.slice(startIndex, endIndex)

  useEffect(() => {
    const fetchConventionsCollectivesDocuments = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          category: "conventions-collectives"
        })

        const response = await fetch(`/api/documents/by-category?${params}`)
        const data = await response.json()

        if (data.success) {
          setDocuments(data.documents)
        }
      } catch (error) {
        console.error("Erreur lors du chargement des conventions collectives:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchConventionsCollectivesDocuments()
  }, [])

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

  const handleSearchSubmit = async (query: string) => {
    if (!query.trim()) return
    window.location.href = `/?search=${encodeURIComponent(query)}`
  }

  const breadcrumbItems = [
    { label: "Accueil", href: "/" },
    { label: "Sources nationales", href: "/" },
    { label: "Conventions collectives", isActive: true }
  ]

  return (
    <div className="min-h-screen bg-white">
      <LahalexHeaderResponsive searchValue={searchValue} onSearchChange={setSearchValue} />
      <LahalexBreadcrumbResponsive items={breadcrumbItems} />

      <div className="flex min-h-[calc(100vh-64px)] lg:min-h-[calc(100vh-80px)]">
        <div className="hidden lg:block w-80 xl:w-96 bg-gray-50 border-r border-gray-200">
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-8">Textes</h1>

              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Sources nationales
                </h2>
                <div className="space-y-2">
                  <div className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm bg-blue-100 text-blue-700 shadow-sm">
                    <span>Conventions collectives</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 lg:py-6">
            <div className="max-w-2xl mx-auto">
              <form onSubmit={(e) => {
                e.preventDefault();
                if (searchValue.trim()) {
                  handleSearchSubmit(searchValue.trim());
                }
              }} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Rechercher dans tous les documents..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-10 text-sm rounded-[6px] placeholder-[#89898A] border"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.06)",
                    borderColor: "#BCBCBC",
                  }}
                />
              </form>
            </div>
          </div>

          <div className="h-full flex flex-col">
            <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 lg:py-6">
              <div className="flex flex-col space-y-2 lg:space-y-3">
                <div className="flex items-center text-sm text-gray-500">
                  <span>Textes</span>
                  <ChevronRight className="w-4 h-4 mx-2" />
                  <span className="text-gray-900 font-medium">Conventions collectives</span>
                </div>
                <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">
                  Conventions collectives
                </h1>
              </div>
            </div>

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
                    Aucune convention collective n'est disponible pour le moment.
                  </p>
                </div>
              ) : (
                <div className="space-y-6 lg:space-y-8">
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

                  <PaginationControls />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
