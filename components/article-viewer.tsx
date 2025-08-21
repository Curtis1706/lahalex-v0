"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Volume2, 
  Download, 
  Copy, 
  Share2, 
  BookOpen, 
  FileText,
  ChevronDown,
  ChevronUp,
  Search
} from 'lucide-react'
import { StructuredArticle } from '@/lib/text-processor'

interface ArticleViewerProps {
  articles: StructuredArticle[]
  onArticleSelect?: (article: StructuredArticle) => void
}

export function ArticleViewer({ articles, onArticleSelect }: ArticleViewerProps) {
  const [selectedArticle, setSelectedArticle] = useState<StructuredArticle | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedArticles, setExpandedArticles] = useState<Set<string>>(new Set())
  const [isReading, setIsReading] = useState(false)
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Filtrer les articles selon la recherche
  const filteredArticles = articles.filter(article =>
    article.article.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.livre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.titre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Fonction pour basculer l'expansion d'un article
  const toggleArticleExpansion = (articleId: string) => {
    const newExpanded = new Set(expandedArticles)
    if (newExpanded.has(articleId)) {
      newExpanded.delete(articleId)
    } else {
      newExpanded.add(articleId)
    }
    setExpandedArticles(newExpanded)
  }

  // Fonction pour lire un article à voix haute
  const readArticle = (article: StructuredArticle) => {
    if (isReading) {
      window.speechSynthesis.cancel()
      setIsReading(false)
      return
    }

    const text = `${article.article}. ${article.content}`
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'fr-FR'
    utterance.rate = 0.9

    utterance.onend = () => setIsReading(false)
    utterance.onerror = () => setIsReading(false)

    speechRef.current = utterance
    window.speechSynthesis.speak(utterance)
    setIsReading(true)
  }

  // Fonction pour copier le contenu d'un article
  const copyArticle = async (article: StructuredArticle) => {
    const text = `${article.article}\n\n${article.content}`
    try {
      await navigator.clipboard.writeText(text)
      // Vous pouvez ajouter une notification de succès ici
    } catch (err) {
      console.error('Erreur lors de la copie:', err)
    }
  }

  // Fonction pour exporter un article en Markdown
  const exportArticleAsMarkdown = (article: StructuredArticle) => {
    const markdown = `# ${article.article}

${article.livre ? `**${article.livre}**` : ''}
${article.titre ? `**${article.titre}**` : ''}

${article.content}
`
    
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${article.article.replace(/\s+/g, '-')}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Fonction pour partager un article
  const shareArticle = async (article: StructuredArticle) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.article,
          text: article.content.substring(0, 200) + '...',
          url: window.location.href
        })
      } catch (err) {
        console.error('Erreur lors du partage:', err)
      }
    } else {
      // Fallback pour les navigateurs qui ne supportent pas l'API Share
      copyArticle(article)
    }
  }

  return (
    <div className="space-y-6">
      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Rechercher dans les articles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Statistiques */}
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <Badge variant="secondary">
          {filteredArticles.length} article{filteredArticles.length > 1 ? 's' : ''}
        </Badge>
        {searchTerm && (
          <span>Résultats pour "{searchTerm}"</span>
        )}
      </div>

      {/* Liste des articles */}
      <div className="space-y-4">
        {filteredArticles.map((article) => {
          const isExpanded = expandedArticles.has(article.id)
          const isSelected = selectedArticle?.id === article.id

          return (
            <Card 
              key={article.id} 
              className={`transition-all duration-200 hover:shadow-md ${
                isSelected ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Hiérarchie */}
                    <div className="article-hierarchy">
                      {article.livre && <span className="livre">{article.livre}</span>}
                      {article.titre && <span className="titre">{article.titre}</span>}
                    </div>
                    
                    {/* Titre de l'article */}
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                      {article.article}
                    </CardTitle>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => readArticle(article)}
                      className="text-gray-600 hover:text-blue-600"
                      title={isReading ? "Arrêter la lecture" : "Lire à voix haute"}
                    >
                      <Volume2 className={`w-4 h-4 ${isReading ? 'text-red-500' : ''}`} />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyArticle(article)}
                      className="text-gray-600 hover:text-green-600"
                      title="Copier l'article"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => exportArticleAsMarkdown(article)}
                      className="text-gray-600 hover:text-purple-600"
                      title="Exporter en Markdown"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => shareArticle(article)}
                      className="text-gray-600 hover:text-orange-600"
                      title="Partager l'article"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Aperçu du contenu */}
                <div className="text-gray-700 leading-relaxed">
                  {isExpanded ? (
                    <div className="space-y-4">
                      <div className="prose max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: article.content }} />
                      </div>
                      
                      {/* Actions supplémentaires */}
                      <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onArticleSelect?.(article)}
                          className="flex items-center gap-2"
                        >
                          <BookOpen className="w-4 h-4" />
                          Voir en détail
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleArticleExpansion(article.id)}
                        >
                          <ChevronUp className="w-4 h-4" />
                          Réduire
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-600 line-clamp-3">
                        {article.content.substring(0, 200)}...
                      </p>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleArticleExpansion(article.id)}
                        className="mt-2 text-blue-600 hover:text-blue-700"
                      >
                        <ChevronDown className="w-4 h-4 mr-1" />
                        Lire plus
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Message si aucun résultat */}
      {filteredArticles.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Aucun article trouvé pour votre recherche.</p>
        </div>
      )}
    </div>
  )
}

