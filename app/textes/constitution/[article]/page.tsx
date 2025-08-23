"use client"

import { useState } from "react"
import { LahalexHeaderResponsive } from "@/components/lahalex-header-responsive"
import { LahalexBreadcrumbResponsive } from "@/components/lahalex-breadcrumb-responsive"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PrinterIcon as Print, Download, Share2, Search } from "lucide-react"
import { ConstitutionSidebar } from "@/components/constitution-sidebar"
import { Footer } from "@/components/footer"

// Données des articles constitutionnels
const articlesData = {
  "article-1": {
    title: "Article 1",
    content: `
      <div class="text-sm text-gray-600 mb-6">Version en vigueur depuis le 1 juin 2021</div>
      <ul class="space-y-3 text-gray-700">
        <li>• L'État du Bénin est une République indépendante et souveraine.</li>
        <li>• La capitale de la République du Bénin est Porto-Novo.</li>
        <li>• L'Emblème national est le drapeau tricolore vert, jaune et rouge. En partant de la hampe, une bande verte sur toute la hauteur et sur les deux cinquièmes de sa longueur, deux bandes horizontales égales: la supérieure jaune, l'inférieure rouge.</li>
        <li>• L'Hymne de la République est "L'AUBE NOUVELLE".</li>
        <li>• La Devise de la République est "FRATERNITÉ - JUSTICE - TRAVAIL".</li>
        <li>• La langue officielle est le Français.</li>
        <li>• Le Sceau de l'État, constitué par un disque de cent vingt millimètres de diamètre, représente:</li>
      </ul>
      
      <div class="ml-8 mt-4 space-y-3 text-gray-700">
        <p>à l'avers, une pirogue chargée de six étoiles à cinq rais voguant sur des ondes, accompagnée, au chef, d'un arc avec une flèche en palme soutenu de deux récades en sautoir et, dans le bas, d'une banderole portant la devise "FRATERNITÉ - JUSTICE - TRAVAIL" avec, à l'entour, l'inscription "République du Bénin";</p>
        
        <p>et, au revers, un écu coupé au premier de sinople, au deuxième parti d'or et de gueules, qui sont les trois couleurs du drapeau, l'écu entouré de deux palmes au naturel, les tiges passées en sautoir.</p>
      </div>
      
      <ul class="mt-4 space-y-3 text-gray-700">
        <li>• Les armes du Bénin sont:</li>
      </ul>
      
      <div class="ml-8 mt-2 space-y-2 text-gray-700">
        <p>• Écartelé au premier quartier d'un château Somba d'or ;</p>
        <p>• Au deuxième d'argent à l'Étoile du Bénin au naturel, c'est-à-dire une croix à huit pointes d'azur anglées de rayons d'argent et de sable en abîme ;</p>
        <p>• Au troisième d'argent palmé de sinople chargé d'un fruit de gueule ;</p>
        <p>• Au quatrième d'argent au navire de sable voguant sur une mer d'azur avec en brochant sur la ligne de l'écartelé un losange de gueule ;</p>
        <p>• Supports: deux panthères d'or tachetées;</p>
        <p>• Timbre : deux cornes d'abondance de sable d'où sortent des épis de maïs;</p>
        <p>• Devise: Fraternité - Justice - Travail en caractère de sable sur une banderole.</p>
      </div>
    `,
  },
  "article-2": {
    title: "Article 2",
    content: `
      <div class="text-sm text-gray-600 mb-6">Version en vigueur depuis le 1 juin 2021</div>
      <ul class="space-y-3 text-gray-700">
        <li>• La République du Bénin est une et indivisible, laïque et démocratique.</li>
        <li>• Son principe est : le Gouvernement du Peuple, par le Peuple et pour le Peuple.</li>
      </ul>
    `,
  },
}

export default function ConstitutionArticlePage({ params }: { params: { article: string } }) {
  const [searchValue, setSearchValue] = useState("")
  const [documentSearch, setDocumentSearch] = useState("")
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["titre-premier"]))

  // Fonction pour la recherche globale depuis le header
  const handleSearchSubmit = async (query: string) => {
    if (!query.trim()) return
    
    // Rediriger vers la page principale avec la recherche
    window.location.href = `/?search=${encodeURIComponent(query)}`
  }

  const article = articlesData[params.article as keyof typeof articlesData]

  if (!article) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article non trouvé</h1>
          <p className="text-gray-600 mb-4">L'article demandé n'existe pas.</p>
          <a href="/textes" className="text-blue-600 hover:underline">
            Retour aux textes
          </a>
        </div>
      </div>
    )
  }

  const breadcrumbItems = [
    { label: "Textes", href: "/textes" },
    { label: "Sources nationales", href: "/textes/sources-nationales" },
    { label: "Textes constitutionnels et fondamentaux", href: "/textes/constitutionnels" },
    { label: "Constitution du Bénin (11 décembre 1990, révisée en 2019)", href: "/textes/constitution" },
    { label: article.title, isActive: true },
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
          <ConstitutionSidebar />

          {/* Contenu principal */}
          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Constitution du Bénin (11 décembre 1990, révisée en 2019)
              </h1>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Titre premier : de l'état et de la souveraineté
              </h2>

              <h3 className="text-lg font-semibold text-gray-900 mb-4">{article.title}</h3>

              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
            </div>
          </div>

          {/* Sidebar droite */}
          <div className="lg:w-80 lg:flex-shrink-0">
            {/* Recherche dans le document */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Rechercher dans le document"
                  value={documentSearch}
                  onChange={(e) => setDocumentSearch(e.target.value)}
                  className="pl-10 border-gray-300"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button className="w-full action-button action-button-secondary">
                <Print className="w-4 h-4" />
                Imprimer
              </Button>

              <Button className="w-full action-button action-button-secondary">
                <Download className="w-4 h-4" />
                1234
              </Button>

              <Button className="w-full action-button action-button-secondary">
                <Share2 className="w-4 h-4" />
                234
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

