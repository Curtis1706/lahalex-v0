"use client"

import { useState } from 'react'
import { LahalexHeaderResponsive } from "@/components/lahalex-header-responsive"
import { LahalexBreadcrumbResponsive } from "@/components/lahalex-breadcrumb-responsive"
import { ArticleTree } from "@/components/article-tree"

import { buildArticleTree, getAllArticles } from "@/lib/articles-data"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  FileText, 
  Search, 
  Filter,
  Download,
  Share2,
  Volume2,
  Copy,
  Eye,
  Settings,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

export default function CodeCommercePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['partie-legislative']))
  
  const articles = getAllArticles()
  const articleTree = buildArticleTree()

  const breadcrumbItems = [
    { label: "Accueil", href: "/" },
    { label: "Codes", href: "/codes" },
    { label: "Code de commerce", isActive: true },
  ]

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  return (
    <div className="min-h-screen bg-white">
      <LahalexHeaderResponsive searchValue="" onSearchChange={() => {}} />
      <LahalexBreadcrumbResponsive items={breadcrumbItems} />
      
      <main className="flex-1 flex">
        {/* Sidebar gauche (Sommaire) - Style Lexis 360 */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 hidden lg:block">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 text-sm">Contenus</h3>
              <button className="text-gray-400 hover:text-gray-600">
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            
            {/* Navigation des contenus */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
                <FileText className="w-4 h-4" />
                Actualités
              </div>
              <div className="flex items-center gap-2 px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
                <BookOpen className="w-4 h-4" />
                Contenus pratiques
                <ChevronRight className="w-3 h-3 ml-auto" />
              </div>
              <div className="flex items-center gap-2 px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
                <FileText className="w-4 h-4" />
                Revues
              </div>
              <div className="flex items-center gap-2 px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
                <FileText className="w-4 h-4" />
                Synthèses
              </div>
              <div className="flex items-center gap-2 px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
                <FileText className="w-4 h-4" />
                Encyclopédies
              </div>
              <div className="flex items-center gap-2 px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
                <FileText className="w-4 h-4" />
                Jurisprudence
                <ChevronRight className="w-3 h-3 ml-auto" />
              </div>
              <div className="flex items-center gap-2 px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
                <FileText className="w-4 h-4" />
                Sources officielles
                <ChevronRight className="w-3 h-3 ml-auto" />
              </div>
            </div>

            {/* Arborescence des articles */}
            <ArticleTree articles={articleTree} />
          </div>
        </div>

        {/* Contenu principal centré */}
        <div className="flex-1 flex flex-col">
          {/* En-tête de l'article - Style Lexis 360 */}
          <div className="bg-white border-b border-gray-200 px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Code de commerce
            </h1>
            <p className="text-gray-600">
              Code de commerce - Article L. 110-1 à Article L. 960-5
            </p>
          </div>

          {/* Contenu principal */}
          <div className="flex-1 px-8 py-6">
            <div className="max-w-4xl mx-auto">
              {/* Structure hiérarchique */}
              <div className="space-y-4">
                {/* Partie législative */}
                <div className="border border-gray-200 rounded-lg">
                  <div 
                    className="flex items-center gap-2 p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleSection('partie-legislative')}
                  >
                    {expandedSections.has('partie-legislative') ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    <span className="font-semibold">Partie législative</span>
                    <Badge variant="outline" className="ml-auto">Article L. 110-1 à Article L. 960-5</Badge>
                  </div>
                  
                  {expandedSections.has('partie-legislative') && (
                    <div className="p-4 space-y-4">
                      {/* LIVRE Ier */}
                      <div className="border-l-2 border-blue-200 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">LIVRE Ier: Du commerce en général.</span>
                          <Badge variant="outline" className="ml-auto text-xs">Article L. 110-1 à Article L. 154-1</Badge>
                        </div>
                        
                        {/* TITRE Ier */}
                        <div className="ml-4 border-l-2 border-green-200 pl-4">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-green-600" />
                            <span className="font-medium">TITRE Ier: De l'acte de commerce.</span>
                            <Badge variant="outline" className="ml-auto text-xs">Article L. 110-1 à Article L. 110-4</Badge>
                          </div>
                          
                          {/* Articles */}
                          <div className="ml-4 space-y-1">
                            {articles.slice(0, 4).map((article) => (
                              <div key={article.id} className="flex items-center gap-2 py-1">
                                <FileText className="w-3 h-3 text-gray-500" />
                                <a 
                                  href={`/article/${article.slug}`}
                                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                  {article.title}
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Autres livres (collapsés) */}
                      {[
                        { title: "LIVRE II: Des sociétés commerciales et des groupements d'intérêt économique.", range: "Article L. 210-1 à Article L. 253-1" },
                        { title: "LIVRE III: De certaines formes de ventes et des clauses d'exclusivité.", range: "Article L. 310-1 à Article L. 341-2" },
                        { title: "LIVRE IV: De la liberté des prix et de la concurrence.", range: "Article L. 410-1 à Article L. 490-14" },
                        { title: "LIVRE V: Des effets de commerce et des garanties.", range: "Article L. 511-1 à Article L. 526-31" },
                        { title: "LIVRE VI: Des difficultés des entreprises.", range: "Article L. 610-1 à Article L. 696-1" },
                        { title: "LIVRE VII: Des juridictions commerciales et de l'organisation du commerce.", range: "Article L. 710-1 à Article L. 762-3" },
                        { title: "LIVRE VIII: De quelques professions réglementées.", range: "Article L. 811-1 à Article L. 835-6" },
                        { title: "LIVRE IX: Dispositions relatives à l'outre-mer.", range: "Article L. 910-1 A à Article L. 960-5" }
                      ].map((livre, index) => (
                        <div key={index} className="border-l-2 border-gray-200 pl-4">
                          <div className="flex items-center gap-2">
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{livre.title}</span>
                            <Badge variant="outline" className="ml-auto text-xs">{livre.range}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Partie réglementaire */}
                <div className="border border-gray-200 rounded-lg">
                  <div 
                    className="flex items-center gap-2 p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleSection('partie-reglementaire')}
                  >
                    {expandedSections.has('partie-reglementaire') ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    <span className="font-semibold">Partie réglementaire</span>
                    <Badge variant="outline" className="ml-auto">Article R. 110-1 à Article R. 960-5</Badge>
                  </div>
                  
                  {expandedSections.has('partie-reglementaire') && (
                    <div className="p-4">
                      <p className="text-gray-600 text-sm">Contenu de la partie réglementaire...</p>
                    </div>
                  )}
                </div>

                {/* Annexes */}
                <div className="border border-gray-200 rounded-lg">
                  <div 
                    className="flex items-center gap-2 p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleSection('annexes')}
                  >
                    {expandedSections.has('annexes') ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    <span className="font-semibold">Annexes de la partie réglementaire</span>
                    <Badge variant="outline" className="ml-auto">Article ANNEXE. 1-3</Badge>
                  </div>
                  
                  {expandedSections.has('annexes') && (
                    <div className="p-4">
                      <p className="text-gray-600 text-sm">Contenu des annexes...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar droite - Outils et actions */}
        <div className="w-80 bg-gray-50 border-l border-gray-200 hidden xl:block">
          <div className="p-4 space-y-6">
            {/* Outils de document */}
            <div className="flex items-center justify-center space-x-2 mb-6">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span className="text-xs">Imprimer</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span className="text-xs">Télécharger</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <Copy className="w-4 h-4" />
                <span className="text-xs">Copier</span>
              </Button>
            </div>

            {/* Recherche dans le document */}
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Recherchez dans le document"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>

            {/* Autres versions */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">Autre(s) version(s) (3)</h4>
              <div className="space-y-3 text-xs">
                <div className="p-2 bg-gray-50 rounded">
                  <div className="font-medium text-gray-900">30/01/2013</div>
                  <div className="text-gray-600">Version précédente</div>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <div className="font-medium text-gray-900">01/11/2009</div>
                  <div className="text-gray-600">Version précédente</div>
                </div>
                <div className="text-center">
                  <button className="text-blue-600 hover:underline text-xs">Voir tout</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Tab de feedback */}
      <div className="fixed right-0 top-1/2 transform -translate-y-1/2 z-50">
        <button className="bg-red-600 text-white px-3 py-2 text-xs font-medium feedback-tab">
          Votre avis
        </button>
      </div>
      
      
    </div>
  )
}






