"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import React from "react"

import { LahalexHeaderResponsive } from "@/components/lahalex-header-responsive"
import { LahalexBreadcrumbResponsive } from "@/components/lahalex-breadcrumb-responsive"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PrinterIcon as Print, Download, Share2, Search, Menu, X, Heart, ChevronUp, ChevronDown } from 'lucide-react'
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import Link from "next/link"
import { ArticleSectionsTableOfContents } from "@/components/article-sections-table-of-contents"
import { Footer } from "@/components/footer"
import type { ArticleMetadata } from "@/types/article"

interface ArticleData extends ArticleMetadata {
content: string
textContent: string
}

// Fonction utilitaire pour échapper les caractères spéciaux pour les expressions régulières
function escapeRegex(text: string): string {
return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export default function ArticlePage({ params: paramsPromise }: { params: Promise<{ slug: string }> }) {
const params = React.use(paramsPromise);
const { slug } = params;
const [searchValue, setSearchValue] = useState("")
const [documentSearch, setDocumentSearch] = useState("")
const [sidebarOpen, setSidebarOpen] = useState(false)
const [article, setArticle] = useState<ArticleData | null>(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)
const [activeSectionId, setActiveSectionId] = useState<string | null>(null)

// État pour la recherche dans le document
const [highlightedContent, setHighlightedContent] = useState<string>("")
const [searchMatches, setSearchMatches] = useState<HTMLElement[]>([])
const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(-1)

const articleContentRef = useRef<HTMLDivElement>(null)
const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({})
const observer = useRef<IntersectionObserver | null>(null)

useEffect(() => {
const fetchArticle = async () => {
try {
  const { slug } = params

  const response = await fetch(`/api/articles/${slug}`)

  if (!response.ok) {
    if (response.status === 404) {
      setError("Article non trouvé")
    } else {
      setError("Erreur lors du chargement de l'article")
    }
    return
  }

  const data = await response.json()
  setArticle(data.article)
  setHighlightedContent(data.article.content) // Initialiser avec le contenu original
} catch (error) {
  console.error("Erreur lors du chargement de l'article:", error)
  setError("Erreur lors du chargement de l'article")
} finally {
  setLoading(false)
}
}

fetchArticle()
}, [params, slug])

useEffect(() => {
// Intersection Observer pour la mise en évidence de la section active lors du défilement
if (article && article.sections.length > 0) {
const observerCallback = (entries: IntersectionObserverEntry[]) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      setActiveSectionId(entry.target.id.replace("section-", ""))
    }
  })
}

observer.current = new IntersectionObserver(observerCallback, {
  root: null,
  rootMargin: "0px 0px -70% 0px",
  threshold: 0,
})

// Observer toutes les sections après le rendu du contenu
// Utiliser un petit délai pour s'assurer que le DOM est entièrement mis à jour après le rendu initial
setTimeout(() => {
  article.sections.forEach((section) => {
    const element = document.getElementById(`section-${section.id}`)
    if (element) {
      observer.current?.observe(element)
      sectionRefs.current[section.id] = element
    }
  })
}, 100)

return () => {
  if (observer.current) {
    observer.current.disconnect()
    observer.current = null
  }
  sectionRefs.current = {}
}
}
}, [article]) // Réexécuter lorsque les données de l'article changent

// Logique de recherche dans le document
const performDocumentSearch = useCallback(() => {
if (!articleContentRef.current || !documentSearch || !article) {
setHighlightedContent(article?.content || "") // Réinitialiser au contenu original
setSearchMatches([])
setCurrentMatchIndex(-1)
return
}

const contentHtml = article.content
const searchTerm = escapeRegex(documentSearch) // Échapper le terme de recherche pour les expressions régulières

let newHighlightedHtml = contentHtml
let matchCounter = 0

// Expression régulière pour trouver le terme de recherche, en évitant les correspondances à l'intérieur des balises HTML ou des balises <mark> existantes
// Cette expression régulière est conçue pour correspondre au texte qui ne fait pas partie d'une balise HTML ou d'une entité HTML,
// et qui n'est pas déjà à l'intérieur d'une balise <mark>.
const regex = new RegExp(`(?<!<mark[^>]*>)((${searchTerm}))`, "gi")

newHighlightedHtml = contentHtml.replace(regex, (match, p1) => {
const id = `search-match-${matchCounter++}`
return `<mark id="${id}" class="bg-yellow-300">${p1}</mark>`
})

setHighlightedContent(newHighlightedHtml)
}, [documentSearch, article]) // Dépend de documentSearch et article

// Effet pour trouver et faire défiler les correspondances après la mise à jour de highlightedContent
useEffect(() => {
if (articleContentRef.current && documentSearch) {
const marks = Array.from(articleContentRef.current.querySelectorAll("mark.bg-yellow-300")) as HTMLElement[]
setSearchMatches(marks)
if (marks.length > 0) {
  setCurrentMatchIndex(0)
  requestAnimationFrame(() => {
    marks[0].scrollIntoView({ behavior: "smooth", block: "center" })
  })
} else {
  setCurrentMatchIndex(-1)
}
} else {
// Si le terme de recherche est vide, réinitialiser la mise en évidence et les correspondances
setHighlightedContent(article?.content || "")
setSearchMatches([])
setCurrentMatchIndex(-1)
}
}, [highlightedContent, documentSearch, article?.content]) // Réexécuter lorsque highlightedContent ou le terme de recherche changent

const handleNextResult = () => {
if (searchMatches.length === 0) return
const nextIndex = (currentMatchIndex + 1) % searchMatches.length
setCurrentMatchIndex(nextIndex)
requestAnimationFrame(() => {
searchMatches[nextIndex].scrollIntoView({ behavior: "smooth", block: "center" })
})
}

const handlePrevResult = () => {
if (searchMatches.length === 0) return
const prevIndex = (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length
setCurrentMatchIndex(prevIndex)
requestAnimationFrame(() => {
searchMatches[prevIndex].scrollIntoView({ behavior: "smooth", block: "center" })
})
}

const handleDocumentSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
setDocumentSearch(e.target.value)
// Déclencher la recherche immédiatement lors du changement, ou lors de la soumission pour des raisons de performance
// Pour l'instant, gardons-le sur la soumission pour de meilleures performances sur les documents volumineux
if (e.target.value === "") {
setHighlightedContent(article?.content || "")
setSearchMatches([])
setCurrentMatchIndex(-1)
}
}

const handleDocumentSearchSubmit = (e: React.FormEvent) => {
e.preventDefault()
performDocumentSearch()
}

if (loading) {
return (
<div className="min-h-screen bg-white">
  <LahalexHeaderResponsive searchValue={searchValue} onSearchChange={setSearchValue} />
  <div className="container-responsive py-4 sm:py-6">
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-8 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  </div>
</div>
)
}

if (error || !article) {
return (
<div className="min-h-screen bg-white flex items-center justify-center">
  <div className="text-center">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">{error || "Article non trouvé"}</h1>
    <p className="text-gray-600 mb-4">L'article demandé n'existe pas ou n'est plus disponible.</p>
    <Link href="/" className="text-blue-600 hover:underline">
      Retour à la veille juridique
    </Link>
  </div>
</div>
)
}

const breadcrumbItems = [
{ label: "Veille juridique", href: "/" },
{ label: article.category.name, href: `/?category=${article.category.slug}` },
{ label: article.title, isActive: true },
]

return (
<div className="min-h-screen bg-white flex flex-col">
<LahalexHeaderResponsive searchValue={searchValue} onSearchChange={setSearchValue} />
<LahalexBreadcrumbResponsive items={breadcrumbItems} />

<main className="flex-1 container-responsive py-4 sm:py-6">
  <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
    {/* Sidebar gauche (Sommaire) */}
    <div className="lg:w-64 lg:flex-shrink-0 order-1 lg:order-1 hidden lg:block">
      {article.sections.length > 0 && (
        <ArticleSectionsTableOfContents
          sections={article.sections}
          activeSectionId={activeSectionId}
          onSetActiveSection={setActiveSectionId}
        />
      )}
    </div>

    {/* Contenu principal de l'article */}
    <div className="flex-1 min-w-0 order-2 lg:order-2">
      {/* En-tête de l'article */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge style={{ backgroundColor: article.category.color }} className="text-white">
            {article.category.name}
          </Badge>
          {article.subcategories?.slice(0, 2).map((subcat) => (
            <Badge key={subcat.id} style={{ backgroundColor: subcat.color }} className="text-white">
              {subcat.name}
            </Badge>
          ))}
          {article.tags.slice(0, 3).map((tag) => (
            <Badge key={tag.id} variant="outline">
              {tag.name}
            </Badge>
          ))}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
          {article.title}
        </h1>

        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
          <span>Publié le {format(new Date(article.publishedAt), "dd MMMM yyyy", { locale: fr })}</span>
          {article.source && (
            <>
              <span className="hidden sm:inline text-gray-400">•</span>
              <span>
                Source :{" "}
                {article.sourceUrl ? (
                  <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {article.source}
                  </a>
                ) : (
                  <span className="text-blue-600">{article.source}</span>
                )}
              </span>
            </>
          )}
          <span className="hidden sm:inline text-gray-400">•</span>
          <span>Par {article.author.name}</span>
        </div>

        {article.description && (
          <p className="text-lg text-gray-700 leading-relaxed mb-4 sm:mb-6 font-medium">{article.description}</p>
        )}
      </div>

      {/* Actions mobiles */}
      <div className="flex flex-wrap gap-2 mb-4 lg:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center space-x-2"
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span>Outils</span>
        </Button>
        <Button variant="outline" size="sm" className="flex items-center space-x-2 bg-transparent">
          <Print className="w-4 h-4" />
          <span>Imprimer</span>
        </Button>
        <Button variant="outline" size="sm" className="flex items-center space-x-2 bg-transparent">
          <Share2 className="w-4 h-4" />
          <span>Partager</span>
        </Button>
      </div>

      {/* Résumé */}
      {article.summary && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 sm:mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Résumé</h3>
          <p className="text-blue-800 leading-relaxed">{article.summary}</p>
        </div>
      )}

      {/* Contenu de l'article */}
      <div className="prose max-w-none legal-document" ref={articleContentRef}>
        <div dangerouslySetInnerHTML={{ __html: highlightedContent }} />
      </div>

      {/* Actions en bas d'article */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
              <Heart className="w-4 h-4" />
              <span>Ajouter aux favoris</span>
            </Button>
            <span className="text-sm text-gray-500">
              {article.favoritesCount} personnes ont ajouté cet article aux favoris
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Partager
            </Button>
          </div>
        </div>
      </div>
    </div>

    {/* Sidebar droite */}
    <div className={`lg:w-64 lg:flex-shrink-0 order-3 lg:order-3 ${sidebarOpen ? "block" : "hidden lg:block"}`}>
      <div className="bg-gray-50 rounded-lg p-4 space-y-4 sm:space-y-6">
        {/* Recherche dans le document */}
        <div>
          <form onSubmit={handleDocumentSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Rechercher dans le document"
              value={documentSearch}
              onChange={handleDocumentSearchChange}
              className="pl-10 border-gray-300 text-sm"
            />
            {documentSearch && searchMatches.length > 0 && (
              <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <span className="text-xs text-gray-500">
                  {currentMatchIndex + 1}/{searchMatches.length}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handlePrevResult}
                  disabled={searchMatches.length === 0}
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleNextResult}
                  disabled={searchMatches.length === 0}
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </div>
            )}
          </form>
        </div>

        {/* Métadonnées */}
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-semibold text-gray-900 mb-3 text-sm">Informations</h4>
          <div className="space-y-2 text-xs text-gray-600">
            <div>
              <span className="font-medium">Catégorie:</span> {article.category.name}
            </div>
            {article.subcategories && article.subcategories.length > 0 && (
              <div>
                <span className="font-medium">Sous-catégories:</span>{" "}
                {article.subcategories.map(sub => sub.name).join(", ")}
              </div>
            )}
            <div>
              <span className="font-medium">Type:</span> {article.documentType}
            </div>
            <div>
              <span className="font-medium">Auteur:</span> {article.author.name}
            </div>
            <div>
              <span className="font-medium">Publié:</span> {format(new Date(article.publishedAt), "dd/MM/yyyy")}
            </div>
            {article.source && (
              <div>
                <span className="font-medium">Source:</span> {article.source}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 sm:space-y-3">
          <Button className="w-full action-button action-button-secondary text-sm">
            <Print className="w-4 h-4" />
            Imprimer
          </Button>

          <Button className="w-full action-button action-button-secondary text-sm">
            <Download className="w-4 h-4" />
            Télécharger TXT
          </Button>

          <Button className="w-full action-button action-button-secondary text-sm">
            <Share2 className="w-4 h-4" />
            Partager
          </Button>
        </div>
      </div>
    </div>
  </div>
</main>
<Footer />
</div>
)
}
