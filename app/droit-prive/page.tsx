"use client"

import { useState } from "react"
import { LahalexHeaderResponsive } from "@/components/lahalex-header-responsive"

import { Input } from "@/components/ui/input"
import { ChevronDown, Search } from "lucide-react"
import Link from "next/link"
import { LahalexBreadcrumbResponsive } from "@/components/lahalex-breadcrumb-responsive"

export default function DroitPrivePage() {
  const [searchValue, setSearchValue] = useState("")
  const [searchKeywords, setSearchKeywords] = useState("")
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["droit-prive", "droit-public"]))

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

  const breadcrumbItems = [
    { label: "Veille juridique", href: "/" }, // Updated link
    { label: "Droit privé", isActive: true },
  ]

  const droitCategories = {
    national: [
      { title: "Droit civil", icon: "⚖️", href: "/droit-prive/droit-civil" },
      { title: "Droit des commerciaux", icon: "⚖️", href: "/droit-prive/droit-commercial" },
      { title: "Droit de bancaire et financier", icon: "⚖️", href: "/droit-prive/droit-bancaire" },
      { title: "Droit des personnes", icon: "⚖️", href: "/droit-prive/droit-personnes" },
      { title: "Droit des sociétés", icon: "⚖️", href: "/droit-prive/droit-societes" },
      { title: "Droit du travail", icon: "⚖️", href: "/droit-prive/droit-travail" },
      { title: "Droit de la famille", icon: "⚖️", href: "/droit-prive/droit-famille" },
      { title: "Droit cambiaire", icon: "⚖️", href: "/droit-prive/droit-cambiaire" },
      { title: "Droit de la sécurité sociale", icon: "⚖️", href: "/droit-prive/droit-securite-sociale" },
      { title: "Droit des biens", icon: "⚖️", href: "/droit-prive/droit-biens" },
      { title: "Droit de la distribution", icon: "⚖️", href: "/droit-prive/droit-distribution" },
      { title: "Droit des transports", icon: "⚖️", href: "/droit-prive/droit-transports" },
      { title: "Droit des contrats", icon: "⚖️", href: "/droit-prive/droit-contrats" },
      { title: "Droit de la consommation", icon: "⚖️", href: "/droit-prive/droit-consommation" },
      { title: "Droit rural", icon: "⚖️", href: "/droit-prive/droit-rural" },
      { title: "Droit des sûretés", icon: "⚖️", href: "/droit-prive/droit-suretes" },
      { title: "Droit de la propriété intellectuelle", icon: "⚖️", href: "/droit-prive/droit-propriete-intellectuelle" },
      { title: "Droit international privé", icon: "⚖️", href: "/droit-prive/droit-international-prive" },
      { title: "Droit de la concurrence", icon: "⚖️", href: "/droit-prive/droit-concurrence" },
      { title: "Droit pénal", icon: "⚖️", href: "/droit-prive/droit-penal" },
    ],
    regional: [
      { title: "Droit de l'OHADA", icon: "⚖️", href: "/droit-prive/ohada" },
      { title: "Droit de la CAE", icon: "⚖️", href: "/droit-prive/cae" },
      { title: "Droit de la ZLECAF", icon: "⚖️", href: "/droit-prive/zlecaf" },
      { title: "Droit de la CEDEAO", icon: "⚖️", href: "/droit-prive/cedeao" },
      { title: "Droit de l'UA", icon: "⚖️", href: "/droit-prive/ua" },
      { title: "Droit de l'UEMOA", icon: "⚖️", href: "/droit-prive/uemoa" },
      { title: "Droit du CILSS", icon: "⚖️", href: "/droit-prive/cilss" },
      { title: "Droit de la CEMAC", icon: "⚖️", href: "/droit-prive/cemac" },
      { title: "Droit de la CEEAC", icon: "⚖️", href: "/droit-prive/ceeac" },
      { title: "Droit de la SADC", icon: "⚖️", href: "/droit-prive/sadc" },
      { title: "Droit de l'OAPI", icon: "⚖️", href: "/droit-prive/oapi" },
      { title: "Droit du COMESA", icon: "⚖️", href: "/droit-prive/comesa" },
      { title: "Droit de l'ARIPO", icon: "⚖️", href: "/droit-prive/aripo" },
    ],
    international: [
      { title: "Organisation des nations unies", icon: "⚖️", href: "/droit-prive/onu" },
      { title: "Asie et pacifique", icon: "⚖️", href: "/droit-prive/asie-pacifique" },
      { title: "Tribunaux et cours internationales", icon: "⚖️", href: "/droit-prive/tribunaux-internationaux" },
      {
        title: "Organisations économiques et financières internationales",
        icon: "⚖️",
        href: "/droit-prive/organisations-economiques",
      },
      { title: "Eurasie", icon: "⚖️", href: "/droit-prive/eurasie" },
      {
        title: "Organisation de coopération internationale",
        icon: "⚖️",
        href: "/droit-prive/cooperation-internationale",
      },
      { title: "Europe", icon: "⚖️", href: "/droit-prive/europe" },
      { title: "Sécurité internationale et désarmement", icon: "⚖️", href: "/droit-prive/securite-internationale" },
      { title: "Amériques", icon: "⚖️", href: "/droit-prive/ameriques" },
      { title: "Énergie et ressources naturelles", icon: "⚖️", href: "/droit-prive/energie-ressources" },
    ],
  }

  return (
    <div className="min-h-screen bg-white">
      <LahalexHeaderResponsive 
        searchValue={searchValue} 
        onSearchChange={setSearchValue} 
        onSearchSubmit={handleSearchSubmit}
      />
      <LahalexBreadcrumbResponsive items={breadcrumbItems} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-8">
          {/* Sidebar gauche */}
          <div className="w-80 flex-shrink-0">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Veille juridique</h2>

            {/* Barre de recherche */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Taper des mots-clés"
                  value={searchKeywords}
                  onChange={(e) => setSearchKeywords(e.target.value)}
                  className="pl-10 border-gray-300"
                />
              </div>
            </div>

            {/* Filtres */}
            <div className="space-y-4">
              <div>
                <button
                  onClick={() => toggleSection("droit-prive")}
                  className="w-full flex items-center justify-between p-3 text-left border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <span className="font-medium">Droit privé</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${expandedSections.has("droit-prive") ? "rotate-180" : ""}`}
                  />
                </button>
              </div>

              <div>
                <button
                  onClick={() => toggleSection("droit-public")}
                  className="w-full flex items-center justify-between p-3 text-left border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <span className="font-medium">Droit public</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${expandedSections.has("droit-public") ? "rotate-180" : ""}`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-gray-900 mb-8">Droit privé</h1>

            {/* Section National */}
            <div className="mb-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">National</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {droitCategories.national.map((category, index) => (
                  <Link
                    key={index}
                    href={category.href}
                    className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-lg">{category.icon}</span>
                    <span className="text-blue-600 hover:text-blue-800 text-sm">{category.title}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Section Régional */}
            <div className="mb-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Régional</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {droitCategories.regional.map((category, index) => (
                  <Link
                    key={index}
                    href={category.href}
                    className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-lg">{category.icon}</span>
                    <span className="text-blue-600 hover:text-blue-800 text-sm">{category.title}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Section International */}
            <div className="mb-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">International</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {droitCategories.international.map((category, index) => (
                  <Link
                    key={index}
                    href={category.href}
                    className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-lg">{category.icon}</span>
                    <span className="text-blue-600 hover:text-blue-800 text-sm">{category.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      
    </div>
  )
}


