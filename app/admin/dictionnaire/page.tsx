"use client"

import { DictionaryAdmin } from "@/components/dictionary-admin"
import { DictionaryImportExport } from "@/components/dictionary-import-export"
import { LahalexHeaderResponsive } from "@/components/lahalex-header-responsive"
import { LahalexBreadcrumbResponsive } from "@/components/lahalex-breadcrumb-responsive"

import { useState } from "react"

export default function AdminDictionnairePage() {
  const [activeTab, setActiveTab] = useState<'terms' | 'import'>('terms')
  const breadcrumbItems = [
    { label: "Accueil", href: "/" },
    { label: "Administration", href: "/admin" },
    { label: "Dictionnaire juridique", isActive: true }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <LahalexHeaderResponsive 
        searchValue="" 
        onSearchChange={() => {}} 
        onSearchSubmit={() => {}} 
      />
      <LahalexBreadcrumbResponsive items={breadcrumbItems} />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Onglets */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('terms')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'terms'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Gestion des termes
              </button>
              <button
                onClick={() => setActiveTab('import')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'import'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Import/Export
              </button>
            </nav>
          </div>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'terms' ? (
          <DictionaryAdmin />
        ) : (
          <DictionaryImportExport onImportComplete={() => setActiveTab('terms')} />
        )}
      </div>


    </div>
  )
}
