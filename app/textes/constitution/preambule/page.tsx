"use client"

import { useState } from "react"
import { LahalexHeaderResponsive } from "@/components/lahalex-header-responsive"
import { LahalexBreadcrumbResponsive } from "@/components/lahalex-breadcrumb-responsive"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, PrinterIcon as Print, Download, Share2 } from "lucide-react"
import { ConstitutionSidebar } from "@/components/constitution-sidebar"


export default function ConstitutionPreambulePage() {
  const [searchValue, setSearchValue] = useState("")

  // Fonction pour la recherche globale depuis le header
  const handleSearchSubmit = async (query: string) => {
    if (!query.trim()) return
    
    // Rediriger vers la page principale avec la recherche
    window.location.href = `/?search=${encodeURIComponent(query)}`
  }

  const breadcrumbItems = [
    { label: "Textes", href: "/textes" },
    { label: "Sources nationales", href: "/textes/sources-nationales" },
    { label: "Textes constitutionnels et fondamentaux", href: "/textes/constitutionnels" },
    { label: "Constitution du Bénin (11 décembre 1990, révisée en 2019)", href: "/textes/constitution" },
    { label: "Préambule", isActive: true },
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
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Préambule</h2>

              <div className="prose max-w-none">
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4 sm:mb-6">
                  Le Dahomey, proclamé République le 4 décembre 1958, a accédé à la souveraineté nationale le 1er août
                  1960. Devenu République populaire du Bénin le 30 novembre 1975, puis République du Bénin le 1er mars
                  1990, il a connu une évolution constitutionnelle et politique mouvementée depuis son accession à
                  l'indépendance. Seule est restée pérenne l'option en faveur de la République.
                </p>

                <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4 sm:mb-6">
                  Les changements successifs de régimes politiques et de gouvernements n'ont pas émoussé la
                  détermination du Peuple Béninois à rechercher dans son génie propre, les valeurs de civilisation
                  culturelle, philosophiques et spirituelles qui animent les formes de son patriotisme.
                </p>

                <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4 sm:mb-6">
                  Ainsi, la Conférence des Forces Vives de la Nation, tenue à Cotonou du 19 au 28 février 1990, en
                  redonnant confiance au peuple, a permis la réconciliation nationale et l'avènement d'une ère de
                  Renouveau Démocratique. Au lendemain de cette Conférence, NOUS, PEUPLE BENINOIS,
                </p>

                <ul className="space-y-3 text-gray-700 mb-6">
                  <li>
                    • Réaffirmons notre opposition fondamentale à tout régime politique fondé sur l'arbitraire, la
                    dictature, l'injustice, la corruption, la concussion, le régionalisme, le népotisme, la confiscation
                    du pouvoir et le pouvoir personnel;
                  </li>
                  <li>
                    • Exprimons notre ferme volonté de défendre et de sauvegarder notre dignité aux yeux du monde et de
                    retrouver la place et le rôle de pionnier de la démocratie et de la défense des droits de l'Homme
                    qui furent naguère les nôtres;
                  </li>
                  <li>
                    • Affirmons solennellement notre détermination par la présente Constitution de créer un État de
                    droit et de démocratie pluraliste, dans lequel les droits fondamentaux de l'Homme, les libertés
                    publiques, la dignité de la personne humaine et la justice sont garantis, protégés et promus comme
                    la condition nécessaire au développement véritable et harmonieux de chaque Béninois tant dans sa
                    dimension temporelle, culturelle, que spirituelle;
                  </li>
                  <li>
                    • Réaffirmons notre attachement aux principes de la démocratie et des Droits de l'Homme, tels qu'ils
                    ont été définis par la Charte des Nations Unies de 1945 et la Déclaration Universelle des Droits de
                    l'Homme de 1948, à la Charte Africaine des Droits de l'Homme et des Peuples adoptée en 1981 par
                    l'Organisation de l'Unité Africaine, ratifiée par le Bénin le 20 janvier 1986, et dont les
                    dispositions font partie intégrante de la présente Constitution et du droit béninois et ont une
                    valeur supérieure
                  </li>
                </ul>
              </div>
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

      
    </div>
  )
}

