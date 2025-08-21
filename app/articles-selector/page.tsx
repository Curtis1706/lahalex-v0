"use client"

import { useState, useEffect } from 'react'
import { LahalexHeaderResponsive } from "@/components/lahalex-header-responsive"
import { LahalexBreadcrumbResponsive } from "@/components/lahalex-breadcrumb-responsive"
import { ArticleSelector } from "@/components/article-selector"
import { ArticleDisplay } from "@/components/article-display"
import { Footer } from "@/components/footer"
import { StructuredArticle } from '@/lib/text-processor'
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
  Settings
} from 'lucide-react'

export default function ArticlesSelectorPage() {
  const [articles, setArticles] = useState<StructuredArticle[]>([])
  const [selectedArticles, setSelectedArticles] = useState<StructuredArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'selector' | 'display'>('selector')

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        // Charger le contenu du fichier de test
        const response = await fetch('/api/articles/code-general-impots-2025')
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des articles')
        }
        
        const data = await response.json()
        
        // Parser les articles structurés à partir du contenu
        const { parseStructuredArticles } = await import('@/lib/text-processor')
        const structuredArticles = parseStructuredArticles(data.article.content)
        
        setArticles(structuredArticles)
      } catch (error) {
        console.error('Erreur:', error)
        setError('Erreur lors du chargement des articles')
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [])

  const breadcrumbItems = [
    { label: "Accueil", href: "/" },
    { label: "Sélecteur d'articles", isActive: true },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <LahalexHeaderResponsive searchValue="" onSearchChange={() => {}} />
        <LahalexBreadcrumbResponsive items={breadcrumbItems} />
        <div className="container-responsive py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <LahalexHeaderResponsive searchValue="" onSearchChange={() => {}} />
        <LahalexBreadcrumbResponsive items={breadcrumbItems} />
        <div className="container-responsive py-8">
          <div className="text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <LahalexHeaderResponsive searchValue="" onSearchChange={() => {}} />
      <LahalexBreadcrumbResponsive items={breadcrumbItems} />
      
      <main className="container-responsive py-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Sélecteur d'Articles
              </h1>
              <p className="text-gray-600">
                Sélectionnez et organisez les articles du Code Général des Impôts
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {articles.length} articles disponibles
              </Badge>
              <Badge variant="outline">
                {selectedArticles.length} sélectionné{selectedArticles.length > 1 ? 's' : ''}
              </Badge>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Livres</p>
                    <p className="text-xl font-semibold">
                      {new Set(articles.map(a => a.livre).filter(Boolean)).size}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Titres</p>
                    <p className="text-xl font-semibold">
                      {new Set(articles.map(a => a.titre).filter(Boolean)).size}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Search className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Recherche</p>
                    <p className="text-xl font-semibold">Avancée</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Copy className="w-8 h-8 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Export</p>
                    <p className="text-xl font-semibold">Multi-format</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation entre les vues */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant={viewMode === 'selector' ? 'default' : 'outline'}
              onClick={() => setViewMode('selector')}
              className="flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Sélectionner
            </Button>
            <Button
              variant={viewMode === 'display' ? 'default' : 'outline'}
              onClick={() => setViewMode('display')}
              className="flex items-center gap-2"
              disabled={selectedArticles.length === 0}
            >
              <Eye className="w-4 h-4" />
              Afficher ({selectedArticles.length})
            </Button>
          </div>

          {selectedArticles.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedArticles([])}
                className="text-red-600 hover:text-red-700"
              >
                Tout supprimer
              </Button>
            </div>
          )}
        </div>

        {/* Contenu principal */}
        {viewMode === 'selector' ? (
          <ArticleSelector 
            articles={articles}
            onArticlesSelected={setSelectedArticles}
          />
        ) : (
          <ArticleDisplay 
            selectedArticles={selectedArticles}
            onRemoveArticle={(articleId) => {
              setSelectedArticles(prev => prev.filter(a => a.id !== articleId))
            }}
            onClearAll={() => setSelectedArticles([])}
          />
        )}
      </main>
      
      <Footer />
    </div>
  )
}






