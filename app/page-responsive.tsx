"use client"

import { useState } from "react"
import { LahalexHeaderResponsive } from "@/components/lahalex-header-responsive"
import { LahalexBreadcrumbResponsive } from "@/components/lahalex-breadcrumb-responsive"
import { FileText, BookOpen, Scale, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function HomeResponsivePage() {
  const [searchValue, setSearchValue] = useState("")

  const breadcrumbItems = [{ label: "Accueil", isActive: true }]

  const mainSections = [
    {
      title: "Veille juridique",
      description: "Suivez l'actualité juridique et les dernières évolutions du droit",
      icon: FileText,
      href: "/veille-juridique",
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Textes",
      description: "Consultez les textes constitutionnels et fondamentaux",
      icon: BookOpen,
      href: "/textes",
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Codes",
      description: "Accédez aux codes juridiques et à leur structure détaillée",
      icon: Scale,
      href: "/codes",
      color: "bg-purple-50 text-purple-600",
    },
  ]

  const quickAccess = [
    { title: "Droit privé", href: "/droit-prive" },
    { title: "Droit public", href: "/droit-public" },
    { title: "Constitution", href: "/constitution" },
    { title: "Code des impôts", href: "/codes/cgi" },
    { title: "Droit OHADA", href: "/droit-ohada" },
    { title: "Jurisprudence", href: "/jurisprudence" },
  ]

  return (
    <div className="min-h-screen bg-white">
      <LahalexHeaderResponsive searchValue={searchValue} onSearchChange={setSearchValue} />
      <LahalexBreadcrumbResponsive items={breadcrumbItems} />

      <div className="container-responsive py-6 sm:py-8 lg:py-12">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
            Bienvenue sur LAHALEX
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
            Votre plateforme juridique professionnelle pour accéder à une bibliothèque complète de documents juridiques
            avec recherche avancée et analyse IA
          </p>
        </div>

        {/* Main Sections */}
        <div className="grid-responsive mb-8 sm:mb-12 lg:mb-16">
          {mainSections.map((section, index) => {
            const IconComponent = section.icon
            return (
              <Link
                key={index}
                href={section.href}
                className="group block p-4 sm:p-6 lg:p-8 border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-200"
              >
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-lg ${section.color} flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform`}
                >
                  <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3 group-hover:text-[#770D28] leading-tight">
                  {section.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-3 sm:mb-4">{section.description}</p>
                <div className="flex items-center text-[#770D28] text-sm sm:text-base font-medium">
                  <span>Accéder</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            )
          })}
        </div>

        {/* Quick Access */}
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6 lg:p-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6 text-center">Accès rapide</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {quickAccess.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="p-3 sm:p-4 bg-white rounded-md border border-gray-200 hover:shadow-md transition-shadow text-center group"
              >
                <div className="text-blue-600 font-medium text-sm sm:text-base group-hover:text-blue-800">
                  {item.title}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Stats Section - Optional */}
        <div className="mt-8 sm:mt-12 lg:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#770D28] mb-1 sm:mb-2">1000+</div>
            <div className="text-xs sm:text-sm text-gray-600">Documents</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#770D28] mb-1 sm:mb-2">50+</div>
            <div className="text-xs sm:text-sm text-gray-600">Codes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#770D28] mb-1 sm:mb-2">24/7</div>
            <div className="text-xs sm:text-sm text-gray-600">Disponible</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#770D28] mb-1 sm:mb-2">IA</div>
            <div className="text-xs sm:text-sm text-gray-600">Assistée</div>
          </div>
        </div>
      </div>

      {/* Footer responsive */}
      <footer className="bg-primary-lahalex text-white py-4 sm:py-6 mt-8 sm:mt-12">
        <div className="container-responsive">
          <div className="footer-links">
            <span>CONDITIONS GÉNÉRALES DE VENTE ET D'UTILISATION</span>
            <span>POLITIQUES DE CONFIDENTIALITÉS</span>
            <span>COPYRIGHT 2025 LAHALEX TOUS DROITS RÉSERVÉS</span>
            <span>POUR DE L'ASSISTANCE : XXXXXXXXX</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
