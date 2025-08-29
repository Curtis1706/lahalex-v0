'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight, FileText, Folder, Search } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useSmartScroll } from '@/hooks/useSmartScroll'
import type { DocumentMetadata, DocumentSection } from '@/types/document'

interface DocumentSidebarProps {
  document: DocumentMetadata
  currentArticle?: string
  className?: string
}

export function DocumentSidebar({ document, currentArticle, className = '' }: DocumentSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredSections, setFilteredSections] = useState(document.structure.sections)
  const { scrollToElement } = useSmartScroll()
  const sidebarRef = useRef<HTMLDivElement>(null)

  const updateExpandedSections = useCallback(() => {
    if (currentArticle && document.structure.sections) {
      const newExpanded = new Set(expandedSections)
      
      const findParentSections = (articleId: string) => {
        document.structure.sections.forEach(section => {
          if (section.children.includes(articleId) || section.id === articleId) {
            newExpanded.add(section.id)
            if (section.parent) {
              newExpanded.add(section.parent)
            }
          }
        })
      }
      
      findParentSections(currentArticle)
      
      const hasChanges = newExpanded.size !== expandedSections.size || 
        [...newExpanded].some(id => !expandedSections.has(id))
      
      if (hasChanges) {
        setExpandedSections(newExpanded)
      }
    }
  }, [currentArticle, document.structure.sections, expandedSections])

  useEffect(() => {
    updateExpandedSections()
  }, [currentArticle])

  useEffect(() => {
    if (currentArticle) {
      setTimeout(() => {
        const currentElement = sidebarRef.current?.querySelector(`[data-article-id="${currentArticle}"]`)
        if (currentElement) {
          scrollToElement(currentElement as HTMLElement, { block: 'nearest' })
        }
      }, 100)
    }
  }, [currentArticle, scrollToElement])

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredSections(document.structure.sections)
      return
    }

    const filtered = document.structure.sections.filter(section =>
      section.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    setFilteredSections(filtered)
    
    const newExpanded = new Set(expandedSections)
    filtered.forEach(section => {
      newExpanded.add(section.id)
      if (section.parent) {
        newExpanded.add(section.parent)
      }
    })
    setExpandedSections(newExpanded)
  }, [searchTerm, document.structure.sections])

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  // Fonction pour rendre un article
  const renderArticle = (articleId: string, level: number) => {
    const isCurrent = articleId === currentArticle
    const indent = level * 16

    return (
      <div key={articleId} className="select-none">
        <Link
          href={`/documents/${document.id}/${articleId}`}
          data-article-id={articleId}
          className={`flex items-center py-2 px-3 transition-colors`}
          style={{ paddingLeft: `${12 + indent}px` }}
        >
          <div className="w-6 mr-2" />
          <FileText className={`w-4 h-4 mr-2 ${isCurrent ? 'text-primary-lahalex' : ''}`} style={isCurrent ? undefined : { color: 'rgba(16, 130, 201, 1)' }} />
          <span className={`text-sm flex-1 truncate ${isCurrent ? 'text-primary-lahalex font-semibold' : ''}`} style={isCurrent ? undefined : { color: 'rgba(16, 130, 201, 1)' }}>
            {articleId.replace('article-', 'Article ')}
          </span>
        </Link>
      </div>
    )
  }

  const renderSection = (section: DocumentSection, level: number = 0) => {
    const isExpanded = expandedSections.has(section.id)
    const hasChildren = section.children.length > 0
    const indent = level * 16
    const isCurrent = section.id === currentArticle
    const isHighlighted = searchTerm && section.title.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Déterminer si cette section doit être cliquable
    const isClickable = section.type === 'section-synthese' || section.type === 'fiche-methode' || section.type === 'section'

    return (
      <div key={section.id} className="select-none">
        <div
          data-article-id={section.type === 'article' ? section.id : undefined}
          className={`flex items-center py-2 px-3 transition-colors ${isCurrent ? '' : 'hover:bg-gray-100'} ${isHighlighted ? 'bg-yellow-50' : ''}`}
          style={{ paddingLeft: `${12 + indent}px` }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleSection(section.id)}
              className="flex-shrink-0 mr-2 p-0.5 hover:bg-gray-200 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 text-gray-500" />
              ) : (
                <ChevronRight className="w-3 h-3 text-gray-500" />
              )}
            </button>
          ) : (
            <div className="w-6 mr-2" />
          )}
          
          <Folder className="w-4 h-4 mr-2 text-gray-600" />
          
          {isClickable ? (
            // Pour les fiches de synthèse et fiches méthodes, utiliser le scroll au lieu de la navigation
            (document.type === 'fiche-synthese' || document.type === 'fiche-methode') ? (
              <button
                onClick={() => {
                  console.log('Button clicked for section:', section.id, section.title);
                  // Ajouter un délai pour s'assurer que le contenu est rendu
                  setTimeout(() => {
                    scrollToElement(sidebarRef.current?.querySelector(`[data-article-id="${section.id}"]`) as HTMLElement, { block: 'nearest' });
                  }, 100);
                }}
                className={`flex-1 text-left text-sm font-medium cursor-pointer ${
                  isCurrent ? 'text-primary-lahalex' : 'text-gray-700'
                } hover:text-primary-lahalex transition-colors`}
                title={section.title}
              >
                {section.title}
              </button>
            ) : (
              <Link
                href={`/documents/${document.id}/${section.id}`}
                className={`flex-1 text-left text-sm font-medium ${
                  isCurrent ? 'text-primary-lahalex' : 'text-gray-700'
                } hover:text-primary-lahalex transition-colors`}
                title={section.title}
              >
                {section.title}
              </Link>
            )
          ) : (
            <span className={`text-sm font-medium flex-1 truncate ${isCurrent ? 'text-primary-lahalex' : 'text-gray-700'}`}>
              {section.title}
            </span>
          )}
        </div>

        {isExpanded && hasChildren && (
          <div className="border-l border-gray-200 ml-6">
            {section.children.map((childId, index) => {
              // Utiliser document.structure.sections au lieu de filteredSections
              const childSection = document.structure.sections.find(s => s.id === childId)
              if (childSection) {
                return (
                  <div key={`${childSection.id}-${level}-${index}`}>
                    {renderSection(childSection, level + 1)}
                  </div>
                )
              }
              
              // Si c'est un article (commence par "article-")
              if (childId.startsWith('article-')) {
                return (
                  <div key={childId} className="select-none">
                    <Link
                      href={`/documents/${document.id}/${childId}`}
                      data-article-id={childId}
                      className={`flex items-center py-2 px-3 transition-colors`}
                      style={{ paddingLeft: `${12 + (level + 1) * 16}px` }}
                    >
                      <div className="w-6 mr-2" />
                      <FileText className={`w-4 h-4 mr-2 ${childId === currentArticle ? 'text-primary-lahalex' : ''}`} style={childId === currentArticle ? undefined : { color: 'rgba(16, 130, 201, 1)' }} />
                      <span className={`text-sm flex-1 truncate ${childId === currentArticle ? 'text-primary-lahalex font-semibold' : ''}`} style={childId === currentArticle ? undefined : { color: 'rgba(16, 130, 201, 1)' }}>
                        {childId.replace('article-', 'Article ').replace('-', '')}
                      </span>
                    </Link>
                  </div>
                )
              }
              
              return null
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div ref={sidebarRef} className={`border-r border-gray-200 flex flex-col ${className}`} style={{ backgroundColor: "#F8F3F4" }}>
      {/* En-tête */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <Link href="/documents" className="text-sm text-blue-600 hover:underline">
          ← Tous les documents
        </Link>
        <h2 className="font-semibold text-gray-900 mt-2 line-clamp-2">
          {document.title}
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          {document.structure.totalArticles} articles
        </p>
      </div>

      {/* Barre de recherche */}
      <div className="p-3 border-b border-gray-200 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <div className="py-2">
          {filteredSections
            .filter(section => !section.parent)
            .map((section, index) => (
              <div key={`root-${section.id}-${index}`}>
                {renderSection(section)}
              </div>
            ))}
        </div>
      </ScrollArea>
    </div>
  )
}









