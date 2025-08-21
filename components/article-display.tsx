"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Copy, 
  Download, 
  Share2, 
  FileText,
  BookOpen,
  Code,
  Eye,
  Trash2
} from 'lucide-react'
import { StructuredArticle } from '@/lib/text-processor'

interface ArticleDisplayProps {
  selectedArticles: StructuredArticle[]
  onRemoveArticle?: (articleId: string) => void
  onClearAll?: () => void
}

export function ArticleDisplay({ selectedArticles, onRemoveArticle, onClearAll }: ArticleDisplayProps) {
  const [activeTab, setActiveTab] = useState('preview')

  // Fonction pour copier tous les articles affichés
  const copyAllArticles = async () => {
    const text = selectedArticles.map(article => 
      `${article.article}\n\n${article.content}\n\n---\n\n`
    ).join('')
    
    try {
      await navigator.clipboard.writeText(text)
      // Vous pouvez ajouter une notification de succès ici
    } catch (err) {
      console.error('Erreur lors de la copie:', err)
    }
  }

  // Fonction pour exporter en Markdown
  const exportAsMarkdown = () => {
    const markdown = selectedArticles.map(article => 
      `# ${article.article}\n\n${article.livre ? `**${article.livre}**\n` : ''}${article.titre ? `**${article.titre}**\n\n` : ''}${article.content}\n\n---\n\n`
    ).join('')
    
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `articles-${new Date().toISOString().split('T')[0]}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Fonction pour exporter en HTML
  const exportAsHTML = () => {
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Articles sélectionnés</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
        .article { margin-bottom: 40px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .hierarchy { color: #666; font-size: 0.9em; margin-bottom: 10px; }
        .title { font-size: 1.5em; font-weight: bold; margin-bottom: 15px; }
        .content { text-align: justify; }
    </style>
</head>
<body>
    ${selectedArticles.map(article => `
    <div class="article">
        <div class="hierarchy">
            ${article.livre ? `<strong>${article.livre}</strong>` : ''}
            ${article.titre ? ` > <strong>${article.titre}</strong>` : ''}
        </div>
        <div class="title">${article.article}</div>
        <div class="content">${article.content}</div>
    </div>
    `).join('')}
</body>
</html>`
    
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `articles-${new Date().toISOString().split('T')[0]}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Fonction pour exporter en JSON
  const exportAsJSON = () => {
    const json = JSON.stringify(selectedArticles, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `articles-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (selectedArticles.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-semibold mb-2">Aucun article sélectionné</h3>
        <p className="text-sm">Sélectionnez des articles pour les afficher ici</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques et actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="secondary">
            {selectedArticles.length} article{selectedArticles.length > 1 ? 's' : ''} sélectionné{selectedArticles.length > 1 ? 's' : ''}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Tout supprimer
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={copyAllArticles}
            className="flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Copier tout
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportAsMarkdown}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export MD
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportAsHTML}
            className="flex items-center gap-2"
          >
            <Code className="w-4 h-4" />
            Export HTML
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportAsJSON}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Onglets pour différents formats d'affichage */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Aperçu
          </TabsTrigger>
          <TabsTrigger value="markdown" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Markdown
          </TabsTrigger>
          <TabsTrigger value="html" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            HTML
          </TabsTrigger>
          <TabsTrigger value="json" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            JSON
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-4">
          {selectedArticles.map((article, index) => (
            <Card key={article.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="article-hierarchy">
                      {article.livre && <span className="livre">{article.livre}</span>}
                      {article.titre && <span className="titre">{article.titre}</span>}
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {article.article}
                    </CardTitle>
                  </div>
                  
                  {onRemoveArticle && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveArticle(article.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: article.content }} />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="markdown">
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-96">
              {selectedArticles.map(article => 
                `# ${article.article}\n\n${article.livre ? `**${article.livre}**\n` : ''}${article.titre ? `**${article.titre}**\n\n` : ''}${article.content}\n\n---\n\n`
              ).join('')}
            </pre>
          </div>
        </TabsContent>

        <TabsContent value="html">
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-96">
              {`<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Articles sélectionnés</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
        .article { margin-bottom: 40px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .hierarchy { color: #666; font-size: 0.9em; margin-bottom: 10px; }
        .title { font-size: 1.5em; font-weight: bold; margin-bottom: 15px; }
        .content { text-align: justify; }
    </style>
</head>
<body>
    ${selectedArticles.map(article => `
    <div class="article">
        <div class="hierarchy">
            ${article.livre ? `<strong>${article.livre}</strong>` : ''}
            ${article.titre ? ` > <strong>${article.titre}</strong>` : ''}
        </div>
        <div class="title">${article.article}</div>
        <div class="content">${article.content}</div>
    </div>
    `).join('')}
</body>
</html>`}
            </pre>
          </div>
        </TabsContent>

        <TabsContent value="json">
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-96">
              {JSON.stringify(selectedArticles, null, 2)}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}






