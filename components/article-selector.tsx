"use client"

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  Filter,
  BookOpen,
  FileText,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { StructuredArticle } from '@/lib/text-processor'

interface ArticleSelectorProps {
  articles: StructuredArticle[]
  onArticlesSelected: (articles: StructuredArticle[]) => void
}

export function ArticleSelector({ articles, onArticlesSelected }: ArticleSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLivre, setSelectedLivre] = useState<string>('all')
  const [selectedTitre, setSelectedTitre] = useState<string>('all')
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set())
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  // Get unique livres and titres for filters
  const livres = useMemo(() => {
    const uniqueLivres = Array.from(new Set(articles.map(a => a.livre).filter(Boolean)))
    return uniqueLivres.sort()
  }, [articles])

  const titres = useMemo(() => {
    const uniqueTitres = Array.from(new Set(articles.map(a => a.titre).filter(Boolean)))
    return uniqueTitres.sort()
  }, [articles])

  // Filter articles based on search and filters
  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesSearch = !searchTerm || 
        article.article.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesLivre = selectedLivre === 'all' || article.livre === selectedLivre
      const matchesTitre = selectedTitre === 'all' || article.titre === selectedTitre
      
      return matchesSearch && matchesLivre && matchesTitre
    })
  }, [articles, searchTerm, selectedLivre, selectedTitre])

  // Group articles by livre and titre
  const groupedArticles = useMemo(() => {
    const groups: { [key: string]: StructuredArticle[] } = {}
    
    filteredArticles.forEach(article => {
      const livre = article.livre || 'Sans livre'
      const titre = article.titre || 'Sans titre'
      const groupKey = `${livre} - ${titre}`
      
      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(article)
    })
    
    return groups
  }, [filteredArticles])

  const handleArticleToggle = (articleId: string) => {
    const newSelected = new Set(selectedArticles)
    if (newSelected.has(articleId)) {
      newSelected.delete(articleId)
    } else {
      newSelected.add(articleId)
    }
    setSelectedArticles(newSelected)
    
    // Update parent component
    const selectedArticlesList = articles.filter(a => newSelected.has(a.id))
    onArticlesSelected(selectedArticlesList)
  }

  const handleSelectAll = () => {
    const allIds = new Set(filteredArticles.map(a => a.id))
    setSelectedArticles(allIds)
    onArticlesSelected(filteredArticles)
  }

  const handleDeselectAll = () => {
    setSelectedArticles(new Set())
    onArticlesSelected([])
  }

  const toggleSection = (sectionKey: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionKey)) {
      newExpanded.delete(sectionKey)
    } else {
      newExpanded.add(sectionKey)
    }
    setExpandedSections(newExpanded)
  }

  const selectedCount = selectedArticles.size
  const allSelected = filteredArticles.length > 0 && selectedCount === filteredArticles.length
  const someSelected = selectedCount > 0 && selectedCount < filteredArticles.length

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher dans les articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={allSelected ? handleDeselectAll : handleSelectAll}
            disabled={filteredArticles.length === 0}
            className="flex items-center gap-2"
          >
            {allSelected ? (
              <CheckSquare className="w-4 h-4" />
            ) : someSelected ? (
              <Square className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            {allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Filtres:</span>
          </div>
          
          <Select value={selectedLivre} onValueChange={setSelectedLivre}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sélectionner un livre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les livres</SelectItem>
              {livres.map(livre => (
                <SelectItem key={livre} value={livre}>{livre}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedTitre} onValueChange={setSelectedTitre}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sélectionner un titre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les titres</SelectItem>
              {titres.map(titre => (
                <SelectItem key={titre} value={titre}>{titre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results summary */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <Badge variant="secondary">
            {filteredArticles.length} article{filteredArticles.length > 1 ? 's' : ''} trouvé{filteredArticles.length > 1 ? 's' : ''}
          </Badge>
          {selectedCount > 0 && (
            <Badge variant="outline">
              {selectedCount} sélectionné{selectedCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>

      {/* Articles List */}
      <div className="space-y-4">
        {Object.entries(groupedArticles).map(([groupKey, groupArticles]) => {
          const isExpanded = expandedSections.has(groupKey)
          const groupSelectedCount = groupArticles.filter(a => selectedArticles.has(a.id)).length
          const isGroupFullySelected = groupSelectedCount === groupArticles.length
          const isGroupPartiallySelected = groupSelectedCount > 0 && groupSelectedCount < groupArticles.length

          return (
            <Card key={groupKey}>
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection(groupKey)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <div>
                      <CardTitle className="text-lg">{groupKey}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {groupArticles.length} article{groupArticles.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {groupSelectedCount}/{groupArticles.length}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (isGroupFullySelected) {
                          // Deselect all in group
                          const newSelected = new Set(selectedArticles)
                          groupArticles.forEach(a => newSelected.delete(a.id))
                          setSelectedArticles(newSelected)
                          const selectedArticlesList = articles.filter(a => newSelected.has(a.id))
                          onArticlesSelected(selectedArticlesList)
                        } else {
                          // Select all in group
                          const newSelected = new Set(selectedArticles)
                          groupArticles.forEach(a => newSelected.add(a.id))
                          setSelectedArticles(newSelected)
                          const selectedArticlesList = articles.filter(a => newSelected.has(a.id))
                          onArticlesSelected(selectedArticlesList)
                        }
                      }}
                    >
                      {isGroupFullySelected ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : isGroupPartiallySelected ? (
                        <Square className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {groupArticles.map(article => (
                      <div
                        key={article.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Checkbox
                          checked={selectedArticles.has(article.id)}
                          onCheckedChange={() => handleArticleToggle(article.id)}
                        />
                        <FileText className="w-4 h-4 text-gray-500" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{article.article}</p>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {article.content.substring(0, 100)}...
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {article.id}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold mb-2">Aucun article trouvé</h3>
          <p className="text-sm">Essayez de modifier vos critères de recherche</p>
        </div>
      )}
    </div>
  )
}



