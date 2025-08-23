"use client"

import { useState } from "react"
import { LahalexHeaderResponsive } from "@/components/lahalex-header-responsive"
import { LahalexBreadcrumbResponsive } from "@/components/lahalex-breadcrumb-responsive"
import { ChevronRight, ChevronDown } from "lucide-react"
import Link from "next/link"
import { Footer } from "@/components/footer"

export default function TextesPage() {
  const [searchValue, setSearchValue] = useState("")
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["titre-premier"]))

  // Fonction pour la recherche globale depuis le header
  const handleSearchSubmit = async (query: string) => {
    if (!query.trim()) return
    
    // Rediriger vers la page principale avec la recherche
    window.location.href = `/?search=${encodeURIComponent(query)}`
  }

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const breadcrumbItems = [{ label: "Textes", isActive: true }]

  const sections = [
    {
      id: "preambule",
      title: "Préambule",
      type: "preambule",
    },
    {
      id: "titre-premier",
      title: "Titre premier : de l'état et de la souveraineté",
      type: "titre",
      articles: [
        { id: "article-1", title: "Article 1", isNew: false },
        { id: "article-2", title: "Article 2", isNew: false },
        { id: "article-3", title: "Article 3", isNew: false },
        { id: "article-4", title: "Article 4", isNew: false },
        { id: "article-5", title: "Article 5 (nouveau)", isNew: true },
        { id: "article-6", title: "Article 6", isNew: false },
      ],
    },
    {
      id: "titre-ii",
      title: "Titre II : Des droits et des devoirs de la personne humaine",
      type: "titre",
    },
    {
      id: "titre-iii",
      title: "Titre III : Du pouvoir exécutif",
      type: "titre",
    },
    {
      id: "titre-iv",
      title: "Titre IV : Du pouvoir législatif",
      type: "titre",
    },
    {
      id: "titre-v",
      title: "Titre V : De la Cour constitutionnelle",
      type: "titre",
    },
    {
      id: "titre-vi",
      title: "Titre VI : Du pouvoir judiciaire",
      type: "titre",
    },
    {
      id: "titre-vii",
      title: "Titre VII : Du conseil économique et sociale",
      type: "titre",
    },
    {
      id: "titre-viii",
      title: "Titre VIII : De la haute autorité de l'audiovisuel et de la communication",
      type: "titre",
    },
    {
      id: "titre-ix",
      title: "Titre IX : Des traités et accords internationnaux",
      type: "titre",
    },
    {
      id: "titre-x",
      title: "Titre X : Des collectivités territoriales",
      type: "titre",
    },
    {
      id: "titre-x-1",
      title: "Titre X-1 (nouveau) : Des élections générales",
      type: "titre",
      isNew: true,
    },
    {
      id: "titre-xi",
      title: "Titre XI : De la révision",
      type: "titre",
    },
    {
      id: "titre-xii",
      title: "Titre XII : Dispositions transitoires et finales",
      type: "titre",
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <LahalexHeaderResponsive 
        searchValue={searchValue} 
        onSearchChange={setSearchValue} 
        onSearchSubmit={handleSearchSubmit}
      />
      <LahalexBreadcrumbResponsive items={breadcrumbItems} />

      <div className="container-responsive py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Sidebar gauche */}
          <div className="lg:w-80 lg:flex-shrink-0 bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Textes</h2>

            <div className="space-y-1">
              {sections.map((section) => (
                <div key={section.id}>
                  {section.type === "preambule" ? (
                    <Link
                      href={`/textes/constitution/preambule`}
                      className="block p-2 text-blue-600 hover:text-blue-800 hover:underline text-sm"
                    >
                      {section.title}
                    </Link>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full flex items-center justify-between p-2 text-left hover:bg-gray-100 rounded"
                      >
                        <span className={`text-sm ${section.isNew ? "text-blue-600" : "text-gray-900"}`}>
                          {expandedSections.has(section.id) ? (
                            <ChevronDown className="w-4 h-4 inline mr-2" />
                          ) : (
                            <ChevronRight className="w-4 h-4 inline mr-2" />
                          )}
                          {section.title}
                        </span>
                      </button>

                      {expandedSections.has(section.id) && section.articles && (
                        <div className="ml-6 space-y-1">
                          {section.articles.map((article) => (
                            <Link
                              key={article.id}
                              href={`/textes/constitution/${article.id}`}
                              className={`block p-2 text-sm hover:underline ${
                                article.isNew ? "text-blue-600" : "text-blue-600"
                              }`}
                            >
                              {article.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contenu principal */}
          <div className="flex-1">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Constitution du Bénin (11 décembre 1990, révisée en 2019)
              </h1>
              <p className="text-gray-600">
                Sélectionnez un titre ou un article dans le menu de gauche pour afficher son contenu.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

