"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Search,
  Printer,
  Download,
  Share2,
  Menu,
  X,
  ChevronUp,
  Highlighter,
  Edit3,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { LahalexHeaderResponsive } from "@/components/lahalex-header-responsive";
import { LahalexBreadcrumbResponsive } from "@/components/lahalex-breadcrumb-responsive";

import { processMarkdownContent } from "@/lib/text-processor";

interface DocumentReaderProps {
  document: any;
  article: any;
  processedContent: string;
  allArticles?: Array<{ metadata: any; content: string }>;
}

interface SearchResult {
  articleId: string;
  articleTitle: string;
  content: string;
  matches: Array<{
    text: string;
    index: number;
  }>;
}

interface UnifiedSearchMatch {
  type: 'current' | 'other';
  articleId: string;
  articleTitle: string;
  matchIndex: number;
  totalMatches: number;
  element?: HTMLElement; // Pour les correspondances dans l'article actuel
}

const getDocumentTypeLabel = (type: string) => {
  const typeLabels = {
    constitution: "Constitutions",
    codes: "Codes",
    code: "Codes",
    loi: "Lois",
    decret: "Décrets",
    "fiche-synthese": "Fiches de synthèse",
    "fiche-methode": "Fiches de méthode",
    other: "Autres documents",
  };
  return typeLabels[type as keyof typeof typeLabels] || "Documents";
};

const getDocumentSource = (document: any, currentPath?: string) => {
  console.log('=== DEBUG getDocumentSource ==='); // Debug log
  console.log('Full document object:', JSON.stringify(document, null, 2)); // Debug log
  console.log('Current path:', currentPath); // Debug log

  // 1. Vérifier le type du document (priorité absolue)
  const docType = document.type || "";
  console.log('Document type:', docType); // Debug log

  if (docType === "ceeac" || docType === "cemac" || docType === "cedeao" || docType === "uemoa") {
    console.log('Document type is regional organization - returning Sources régionales');
    return "Sources régionales";
  }

  // 2. Vérifier la catégorie du document
  const category = document.category || document.document_type || "";
  console.log('Document category:', category); // Debug log

  if (
    category.includes("cemac") ||
    category.includes("ceeac") ||
    category.includes("cedeao") ||
    category.includes("uemoa")
  ) {
    console.log('Detected regional organization from category'); // Debug log
    return "Sources régionales";
  } else if (
    category.includes("ohada") ||
    category.includes("union-africaine") ||
    category.includes("conventions-internationales")
  ) {
    console.log('Detected international organization from category'); // Debug log
    return "Sources internationales";
  }

  // 3. Vérifier l'URL actuelle pour déterminer la source
  if (currentPath) {
    if (currentPath.startsWith('/source-regional')) {
      console.log('Detected source from URL: régionales'); // Debug log
      return "Sources régionales";
    } else if (currentPath.startsWith('/source-international')) {
      console.log('Detected source from URL: internationales'); // Debug log
      return "Sources internationales";
    }
  }

  // 4. Vérifier la propriété source du document si elle existe
  const source = document.source || "";
  if (source) {
    console.log('Source property found:', source); // Debug log
    if (source.toLowerCase().includes('regional')) {
      console.log('Detected source from document: régionales'); // Debug log
      return "Sources régionales";
    } else if (source.toLowerCase().includes('international')) {
      console.log('Detected source from document: internationales'); // Debug log
      return "Sources internationales";
    } else if (source.toLowerCase().includes('national')) {
      console.log('Detected source from document: nationales'); // Debug log
      return "Sources nationales";
    }
  } else {
    console.log('No source property found in document'); // Debug log
  }

  // 5. Fallback par défaut
  console.log('Using default fallback: nationales'); // Debug log
  return "Sources nationales";
};

export function DocumentReader({
  document,
  article,
  processedContent,
  allArticles,
}: DocumentReaderProps) {
  console.log('DocumentReader rendered with allArticles length:', allArticles?.length);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [documentSearch, setDocumentSearch] = useState("");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchMatches, setSearchMatches] = useState<HTMLElement[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(-1);
  const [isSearching, setIsSearching] = useState(false);
  const [unifiedMatches, setUnifiedMatches] = useState<UnifiedSearchMatch[]>([]);
  const [currentUnifiedIndex, setCurrentUnifiedIndex] = useState<number>(-1);
  const [fullFicheContent, setFullFicheContent] = useState<string>("");

  const sidebarRef = useRef<HTMLDivElement>(null);
  const sidebarMobileRef = useRef<HTMLDivElement>(null);
  const articleContentRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const router = useRouter();

  // Fonction pour charger tout le contenu d'une fiche de synthèse
  const loadFullFicheContent = useCallback(async () => {
    console.log('loadFullFicheContent called');
    console.log('Document type:', document.type);
    console.log('All articles length:', allArticles?.length);
    
    if (document.type === 'fiche-methode') {
      console.log('Processing fiche-methode content');
      
      try {
        // Pour les fiches méthodes, charger le contenu réel de chaque section
        let fullContent = '';
        
        // Ajouter le titre principal du document
        fullContent += `**${document.title}**\n\n`;
        
        // Ajouter la description
        if (document.description) {
          fullContent += `${document.description}\n\n`;
        }

        // Ajouter le contenu de chaque section dans l'ordre
        const sortedSections = document.structure.sections.sort((a, b) => a.order - b.order);
        
        for (const section of sortedSections) {
          if (section.title) {
            // Ajouter le titre de la section en gras
            fullContent += `**${section.title}**\n\n`;
            
            // Charger le contenu réel de cette section
            try {
              const response = await fetch(`/api/documents/${document.id}/${section.id}`);
              if (response.ok) {
                const articleData = await response.json();
                if (articleData.content) {
                  fullContent += `${articleData.content}\n\n`;
                }
              } else {
                fullContent += `*Contenu de la section ${section.title} non disponible*\n\n`;
              }
            } catch (error) {
              console.error(`Erreur lors du chargement de la section ${section.id}:`, error);
              fullContent += `*Erreur lors du chargement de la section ${section.title}*\n\n`;
            }
          }
        }

        console.log('Full content length:', fullContent.length);
        console.log('Full content preview:', fullContent.substring(0, 200));
        
        setFullFicheContent(fullContent);
      } catch (error) {
        console.error('Erreur lors du chargement du contenu complet:', error);
        setFullFicheContent(processedContent); // Fallback au contenu de l'article actuel
      }
      return;
    }
    
    if (document.type === 'fiche-synthese') {
      try {
        console.log('Loading full content for fiche-synthese via API reconstruction');
        
        // Pour les fiches de synthèse, reconstruire le contenu via API comme pour les fiches méthodes
        let fullContent = '';
        
        // Ajouter le titre principal du document
        fullContent += `# ${document.title}\n\n`;
        
        // Ajouter la description
        if (document.description) {
          fullContent += `${document.description}\n\n`;
        }

        // Reconstruire le contenu en récupérant chaque section via API
        for (const section of document.structure.sections) {
          try {
            console.log(`Fetching content for section: ${section.id}`);
            const response = await fetch(`/api/documents/${document.id}/${section.id}`);
            
            if (response.ok) {
              const articleData = await response.json();
              
              if (articleData.metadata.title && articleData.content) {
                // Ajouter le titre de la section
                fullContent += `## ${articleData.metadata.title}\n\n`;
                // Ajouter le contenu de la section
                fullContent += `${articleData.content}\n\n`;
              }
            } else {
              console.warn(`Failed to fetch section ${section.id}:`, response.status);
            }
          } catch (sectionError) {
            console.error(`Error fetching section ${section.id}:`, sectionError);
          }
        }

        setFullFicheContent(fullContent);
      } catch (error) {
        console.error('Erreur lors du chargement du contenu complet:', error);
        setFullFicheContent(processedContent); // Fallback au contenu de l'article actuel
      }
    }
  }, [document.type, document.title, document.description, allArticles, processedContent]);

  // Charger le contenu complet au montage du composant pour les fiches de synthèse
  useEffect(() => {
    console.log('useEffect for loadFullFicheContent triggered');
    console.log('Document type:', document.type);
    console.log('All articles available:', !!allArticles);
    console.log('All articles length:', allArticles?.length);
    
    if (document.type === 'fiche-methode' || document.type === 'fiche-synthese') {
      console.log(`Calling loadFullFicheContent for ${document.type}`);
      loadFullFicheContent();
    }
  }, [document.type, loadFullFicheContent, allArticles]);

  // État pour le contenu traité complet
  const [processedFullContent, setProcessedFullContent] = useState<string>("");

  // Traiter le contenu complet quand il change
  useEffect(() => {
    if ((document.type === 'fiche-synthese' || document.type === 'fiche-methode') && fullFicheContent) {
      processMarkdownContent(fullFicheContent).then(setProcessedFullContent);
    }
  }, [document.type, fullFicheContent]);

  // Fonction pour la recherche globale depuis le header
  const handleSearchSubmit = async (query: string) => {
    if (!query.trim()) return
    
    // Rediriger vers la page principale avec la recherche
    window.location.href = `/?search=${encodeURIComponent(query)}`
  }

  // Auto-expand sections contenant l'article actuel et toutes les sections avec des articles
  useEffect(() => {
      const newExpanded = new Set(expandedSections);
    
    // Étendre les sections contenant l'article actuel
    if (article?.metadata?.path) {
      article.metadata.path.forEach((parentId: string) => {
        newExpanded.add(parentId);
      });
    }
    
    // Étendre automatiquement toutes les sections de niveau 1 qui ont des articles
    document.structure.sections.forEach((section: any) => {
      if (section.level === 1 && section.children && section.children.length > 0) {
        newExpanded.add(section.id);
      }
    });
    
    setExpandedSections(newExpanded);
  }, [article?.metadata?.id, document.structure.sections]);

  // Scroll vers l'article actuel dans la sidebar (desktop + mobile)
  useEffect(() => {
    const ref = isMobile ? sidebarMobileRef : sidebarRef;
    if (article?.metadata?.id) {
      setTimeout(() => {
        const currentElement = ref.current?.querySelector(
          `[data-article-id="${article.metadata.id}"]`
        );
        if (currentElement) {
          currentElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 100);
    }
  }, [article?.metadata?.id, isMobile]);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [article.id, isMobile]);



  // Fonction pour échapper les caractères spéciaux dans les regex
  const escapeRegex = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  // Logique de recherche dans tout le document
  const performDocumentSearch = useCallback(async () => {
    if (!documentSearch || documentSearch.trim() === '') {
          setSearchResults([]);
    setSearchMatches([]);
    setCurrentMatchIndex(-1);
    setUnifiedMatches([]);
    setCurrentUnifiedIndex(-1);
    // Restaurer le contenu original
    if (articleContentRef.current) {
      let contentToRestore;
      
      // Pour les fiches méthodes, restaurer le contenu complet avec les ancres
      if (document.type === 'fiche-methode' && processedFullContent) {
        let content = processedFullContent;
        document.structure.sections.forEach((section: any) => {
          const anchorId = section.id;
          const titleRegex = new RegExp(`<strong>${section.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</strong>`, 'gi');
          content = content.replace(titleRegex, `<strong id="${anchorId}">${section.title}</strong>`);
        });
        contentToRestore = content;
      } else if (document.type === 'fiche-synthese' && processedFullContent) {
        contentToRestore = processedFullContent;
      } else {
        contentToRestore = processedContent;
      }
      
      articleContentRef.current.innerHTML = contentToRestore;
    }
    return;
    }

    setIsSearching(true);
    
    try {
    const searchTerm = escapeRegex(documentSearch);
      const regex = new RegExp(`(${searchTerm})`, "gi");
      
      // Déterminer le contenu à rechercher
      const contentToSearch = (document.type === 'fiche-synthese' || document.type === 'fiche-methode') && processedFullContent 
        ? processedFullContent 
        : processedContent;
      
      // Rechercher dans l'article actuel ou le contenu complet
      const currentArticleMatches = [...contentToSearch.matchAll(regex)];
      
      // Rechercher dans tous les autres articles si disponibles
      let allSearchResults: SearchResult[] = [];
      
      if (allArticles && allArticles.length > 0) {
        for (const articleData of allArticles) {
          if (articleData.metadata.id === article.metadata.id) continue; // Ignorer l'article actuel
          
          const articleMatches = [...articleData.content.matchAll(regex)];
          if (articleMatches.length > 0) {
            allSearchResults.push({
              articleId: articleData.metadata.id,
              articleTitle: articleData.metadata.title,
              content: articleData.content,
              matches: articleMatches.map((match, index) => ({
                text: match[0],
                index: match.index || 0
              }))
            });
          }
        }
      }
      
      // Mettre à jour les résultats de recherche
      setSearchResults(allSearchResults);
      
      // Créer la liste unifiée de toutes les correspondances
      let unifiedMatchesList: UnifiedSearchMatch[] = [];
      
      // Ajouter les correspondances de l'article actuel ou du contenu complet
      if (currentArticleMatches.length > 0) {
        // Créer une copie du contenu HTML pour le surlignage
        let newHighlightedHtml = contentToSearch;
        let matchCounter = 0;
        
        // Remplacer chaque correspondance par un élément span avec une classe spéciale
        newHighlightedHtml = contentToSearch.replace(regex, (match) => {
      const id = `search-match-${matchCounter++}`;
          return `<span id="${id}" class="search-highlight">${match}</span>`;
    });

        // Mettre à jour le DOM
        if (articleContentRef.current) {
          articleContentRef.current.innerHTML = newHighlightedHtml;

          // Attendre que le DOM soit mis à jour
          setTimeout(() => {
      const marks = Array.from(
              articleContentRef.current?.querySelectorAll("span.search-highlight") || []
      ) as HTMLElement[];
            
      setSearchMatches(marks);
            
            // Créer les correspondances unifiées pour l'article actuel
            const currentUnifiedMatches: UnifiedSearchMatch[] = marks.map((mark, index) => ({
              type: 'current' as const,
              articleId: article.metadata.id,
              articleTitle: article.metadata.title,
              matchIndex: index,
              totalMatches: marks.length,
              element: mark
            }));
            
            // Ajouter les correspondances des autres articles
            const otherUnifiedMatches: UnifiedSearchMatch[] = allSearchResults.flatMap(result => 
              result.matches.map((match, index) => ({
                type: 'other' as const,
                articleId: result.articleId,
                articleTitle: result.articleTitle,
                matchIndex: index,
                totalMatches: result.matches.length
              }))
            );
            
            const allUnifiedMatches = [...currentUnifiedMatches, ...otherUnifiedMatches];
            setUnifiedMatches(allUnifiedMatches);
            
            if (allUnifiedMatches.length > 0) {
              setCurrentUnifiedIndex(0);
              // Surligner la première correspondance de l'article actuel
              if (currentUnifiedMatches.length > 0) {
                currentUnifiedMatches[0].element?.classList.add('current-match');
                currentUnifiedMatches[0].element?.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            }
          }, 100); // Augmenter le délai pour s'assurer que le DOM est mis à jour
      }
    } else {
      setSearchMatches([]);
      setCurrentMatchIndex(-1);
        
        // Créer les correspondances unifiées seulement pour les autres articles
        const otherUnifiedMatches: UnifiedSearchMatch[] = allSearchResults.flatMap(result => 
          result.matches.map((match, index) => ({
            type: 'other' as const,
            articleId: result.articleId,
            articleTitle: result.articleTitle,
            matchIndex: index,
            totalMatches: result.matches.length
          }))
        );
        
        setUnifiedMatches(otherUnifiedMatches);
        if (otherUnifiedMatches.length > 0) {
          setCurrentUnifiedIndex(0);
        }
        
        // Restaurer le contenu original
        if (articleContentRef.current) {
          const contentToRestore = (document.type === 'fiche-synthese' || document.type === 'fiche-methode') && processedFullContent 
            ? processedFullContent 
            : processedContent;
          articleContentRef.current.innerHTML = contentToRestore;
        }
      }
      
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    } finally {
      setIsSearching(false);
    }
  }, [documentSearch, processedContent, processedFullContent, document.type, allArticles, article.metadata.id]);



  const handleNextResult = () => {
    if (unifiedMatches.length === 0) return;
    
    // Retirer la classe current-match de l'élément actuel s'il est dans l'article actuel
    if (currentUnifiedIndex >= 0 && unifiedMatches[currentUnifiedIndex]) {
      const currentMatch = unifiedMatches[currentUnifiedIndex];
      if (currentMatch.type === 'current' && currentMatch.element) {
        currentMatch.element.classList.remove('current-match');
      }
    }
    
    const nextIndex = (currentUnifiedIndex + 1) % unifiedMatches.length;
    setCurrentUnifiedIndex(nextIndex);
    
    const nextMatch = unifiedMatches[nextIndex];
    
    if (nextMatch.type === 'current' && nextMatch.element) {
      // C'est une correspondance dans l'article actuel
      nextMatch.element.classList.add('current-match');
      nextMatch.element.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    } else {
      // C'est une correspondance dans un autre article
      // Rediriger vers cet article sans actualisation
      router.push(`/documents/${document.id}/${nextMatch.articleId}`);
    }
  };

  const handlePrevResult = () => {
    if (unifiedMatches.length === 0) return;
    
    // Retirer la classe current-match de l'élément actuel s'il est dans l'article actuel
    if (currentUnifiedIndex >= 0 && unifiedMatches[currentUnifiedIndex]) {
      const currentMatch = unifiedMatches[currentUnifiedIndex];
      if (currentMatch.type === 'current' && currentMatch.element) {
        currentMatch.element.classList.remove('current-match');
      }
    }
    
    const prevIndex = (currentUnifiedIndex - 1 + unifiedMatches.length) % unifiedMatches.length;
    setCurrentUnifiedIndex(prevIndex);
    
    const prevMatch = unifiedMatches[prevIndex];
    
    if (prevMatch.type === 'current' && prevMatch.element) {
      // C'est une correspondance dans l'article actuel
      prevMatch.element.classList.add('current-match');
      prevMatch.element.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    } else {
      // C'est une correspondance dans un autre article
      // Rediriger vers cet article sans actualisation
      router.push(`/documents/${document.id}/${prevMatch.articleId}`);
    }
  };

  const handleDocumentSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDocumentSearch(e.target.value);
    if (e.target.value === "" || e.target.value.trim() === "") {
      setSearchResults([]);
      setSearchMatches([]);
      setCurrentMatchIndex(-1);
      // Restaurer le contenu original
      if (articleContentRef.current) {
        let contentToRestore;
        
        // Pour les fiches méthodes, restaurer le contenu complet avec les ancres
        if (document.type === 'fiche-methode' && processedFullContent) {
          let content = processedFullContent;
          document.structure.sections.forEach((section: any) => {
            const anchorId = section.id;
            const titleRegex = new RegExp(`<strong>${section.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</strong>`, 'gi');
            content = content.replace(titleRegex, `<strong id="${anchorId}">${section.title}</strong>`);
          });
          contentToRestore = content;
        } else if (document.type === 'fiche-synthese' && processedFullContent) {
          contentToRestore = processedFullContent;
        } else {
          contentToRestore = processedContent;
        }
        
        articleContentRef.current.innerHTML = contentToRestore;
      }
    } else {
      // Déclencher la recherche automatiquement quand l'utilisateur tape
      setTimeout(() => {
        performDocumentSearch();
      }, 300);
    }
  };

  const handleDocumentSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (documentSearch.trim()) {
    performDocumentSearch();
    }
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getColorByType = (
    type: string,
    level: number,
    isCurrentArticle: boolean
  ) => {
    if (isCurrentArticle) return "text-primary-lahalex font-semibold";
    if (type === "article") return "text-blue-600 hover:text-blue-700";

    switch (level) {
      case 1:
        return "text-gray-900 font-semibold";
      case 2:
        return "text-gray-800 font-medium";
      case 3:
        return "text-gray-700 font-medium";
      case 4:
        return "text-gray-700";
      case 5:
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  const renderSection = (section: any, level = 0) => {
    const hasChildren = section.children && section.children.length > 0;
    const isExpanded = expandedSections.has(section.id);
    const isCurrentArticle = article.metadata.id === section.id;
    const colorClass = getColorByType(
      section.type,
      section.level,
      isCurrentArticle
    );

    // Déterminer si cette section doit être cliquable (article ou section-synthese)
    const isClickable = section.type === "article" || section.type === "section-synthese";

    return (
      <div key={section.id} className="w-full">
        <div
          data-article-id={isClickable ? section.id : undefined}
          className={`flex items-start w-full px-3 py-2 text-sm transition-all duration-200 group ${
            isCurrentArticle ? "" : "hover:bg-gray-50"
          }`}
          style={{ paddingLeft: `${12 + level * 16}px` }}
        >
          {hasChildren && section.type !== "article" && section.type !== "section-synthese" && (
            <button
              onClick={() => toggleSection(section.id)}
              className="flex-shrink-0 mr-2 p-0.5 hover:bg-gray-200 rounded transition-colors mt-0.5"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 text-gray-500" />
              ) : (
                <ChevronRight className="w-3 h-3 text-gray-500" />
              )}
            </button>
          )}

          {(!hasChildren || isClickable) && (
            <div className="w-4 mr-2 flex-shrink-0" />
          )}

          {isClickable ? (
            // Pour les fiches méthodes, utiliser le scroll au lieu de la navigation
            document.type === 'fiche-methode' ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Button clicked for section:', section.id, section.title);
                  // Ajouter un délai pour s'assurer que le contenu est rendu
                  setTimeout(() => {
                    scrollToSection(section.id);
                  }, 100);
                  isMobile && setSidebarOpen(false);
                }}
                className={`flex-1 text-left leading-relaxed cursor-pointer ${
                  isCurrentArticle ? colorClass : ""
                }`}
                title={section.title}
                style={
                  isCurrentArticle
                    ? undefined
                    : { color: "rgba(16, 130, 201, 1)" }
                }
              >
                <span className="block break-words">{section.title}</span>
              </button>
            ) : (
              <Link
                href={`/documents/${document.id}/${section.id}`}
                className={`flex-1 text-left leading-relaxed ${
                  isCurrentArticle ? colorClass : ""
                }`}
                onClick={() => isMobile && setSidebarOpen(false)}
                title={section.title}
                style={
                  isCurrentArticle
                    ? undefined
                    : { color: "rgba(16, 130, 201, 1)" }
                }
              >
                <span className="block break-words">{section.title}</span>
              </Link>
            )
          ) : (
            <button
              onClick={() => hasChildren && toggleSection(section.id)}
              className={`flex-1 text-left ${colorClass} leading-relaxed`}
              title={section.title}
            >
              <span className="block break-words">{section.title}</span>
            </button>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="border-l border-gray-200 ml-6">
            {section.children.map((childId: string) => {
              const childSection = document.structure.sections.find(
                (s: any) => s.id === childId
              );
              return childSection
                ? renderSection(childSection, level + 1)
                : null;
            })}
          </div>
        )}
      </div>
    );
  };

  // Fonction pour faire défiler vers une section (pour les fiches méthodes)
  const scrollToSection = (sectionId: string) => {
    console.log('scrollToSection called with sectionId:', sectionId);
    
    // Utiliser un délai pour s'assurer que le DOM est prêt
    setTimeout(() => {
      if (typeof window !== 'undefined' && typeof document !== 'undefined' && typeof document.getElementById === 'function') {
        try {
          console.log('Looking for element with id:', sectionId);
          const element = document.getElementById(sectionId);
          console.log('Element found:', !!element);
          
          if (element) {
            console.log('Scrolling to element');
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Ajouter un effet de surbrillance temporaire
            element.style.backgroundColor = '#fef3c7';
            element.style.transition = 'background-color 0.3s ease';
            setTimeout(() => {
              if (element && element.style) {
                element.style.backgroundColor = '';
              }
            }, 2000);
          } else {
            console.log('Element not found, available elements with IDs:');
            const allElementsWithId = document.querySelectorAll('[id]');
            allElementsWithId.forEach(el => {
              console.log(`- ${el.id}: ${el.tagName}`);
            });
          }
        } catch (error) {
          console.error('Erreur lors du scroll vers la section:', error);
        }
      } else {
        console.log('Window, document, or getElementById not available');
        // Retry après un délai plus long
        setTimeout(() => {
          if (typeof window !== 'undefined' && typeof document !== 'undefined' && typeof document.getElementById === 'function') {
            console.log('Retry successful, attempting scroll again');
            scrollToSection(sectionId);
          }
        }, 1000);
      }
    }, 500); // Délai plus long pour s'assurer que le DOM est prêt
  };

  // Calcul de la source pour le fil d'ariane
  const currentSource = getDocumentSource(document, pathname);
  console.log('Final source for breadcrumb:', currentSource); // Debug log

  // Construire le breadcrumb en évitant les répétitions
  const breadcrumbItems = [
    { label: "Accueil", href: "/" },
    { label: "Textes", href: "/documents" },
    { label: currentSource, href: "/documents" },
    {
      label: getDocumentTypeLabel(document.type),
      href: `/documents?type=${document.type}`,
    },
  ];

  // Ajouter le titre du document seulement s'il est différent du titre de l'article
  // ou s'il s'agit d'une fiche méthode (pour éviter la répétition)
  if (document.type !== 'fiche-methode' || document.title !== article.metadata.title) {
    breadcrumbItems.push({ label: document.title, href: `/documents/${document.id}` });
  }

  // Ajouter le titre de l'article comme élément actif
  breadcrumbItems.push({ label: article.metadata.title, isActive: true });

  return (
    <div className="min-h-screen bg-white">
      <LahalexHeaderResponsive
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearchSubmit={handleSearchSubmit}
      />
      <LahalexBreadcrumbResponsive items={breadcrumbItems} />

      <div className="flex min-h-[calc(100vh-200px)]">
        {/* Sidebar Gauche - Toujours visible, adaptée selon le type */}
        <div
          className="hidden lg:block w-80 border-r border-gray-200 flex flex-col h-[calc(100vh-200px)] overflow-y-auto"
          style={{ backgroundColor: "#F8F3F4" }}
        >
          <div
            className="p-4 border-b border-gray-200 flex-shrink-0"
            style={{ backgroundColor: "#F8F3F4" }}
          >
            <h2 className="text-lg font-bold text-gray-900">
              {getDocumentTypeLabel(document.type)}
            </h2>
          </div>

          <ScrollArea className="flex-1 h-full" ref={sidebarRef}>
            <div className="p-2 space-y-1">
              {/* Gestion spéciale pour les fiches méthodes */}
              {document.type === 'fiche-methode' ? (
                // Pour les fiches méthodes, afficher toutes les sections comme des articles
                document.structure.sections
                  .filter((section: any) => section.type === 'section-synthese')
                  .sort((a: any, b: any) => a.order - b.order)
                  .map((section: any) => renderSection(section))
              ) : (
                // Pour les autres documents, utiliser la logique normale
                document.structure.sections
                  .filter((section: any) => {
                    // Afficher les sections de niveau 1 et 2, ou les titres et articles principaux
                    const isLevel1Or2 = section.level === 1 || section.level === 2;
                    const isTitreOrArticle = section.type === 'titre' || section.type === 'article';
                    
                    // Vérifier si cette section est un enfant d'une autre section
                    const isChildOfAnotherSection = document.structure.sections.some((parentSection: any) => 
                      parentSection.children && parentSection.children.includes(section.id)
                    );
                    
                    // Afficher si c'est un niveau 1/2 OU un titre/article, MAIS pas si c'est un enfant
                    return (isLevel1Or2 || isTitreOrArticle) && !isChildOfAnotherSection;
                  })
                  .map((section: any) => renderSection(section))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Contenu Principal - Milieu - Ajusté pour les fiches de méthode */}
        <div className="flex-1 min-w-0 overflow-y-auto h-[calc(100vh-200px)]">
          <div
            className="max-w-4xl mx-auto p-4 lg:p-8 bg-white"
            style={{ backgroundColor: "#FFFFFF" }}
          >
            {/* En-tête simplifié pour les fiches de synthèse */}
            {(document.type === 'fiche-synthese' || document.type === 'fiche-methode') ? (
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                  {document.title}
                </h1>
                {document.description && (
                  <div className="text-lg text-gray-600 mb-8 text-center max-w-4xl mx-auto leading-relaxed">
                    {document.description}
                  </div>
                )}
              </div>
            ) : (
            <div className="mb-8">
              <div className="text-sm text-gray-600 font-bold mb-6">
                {document.description}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-6">
                {article.metadata.title}
              </h1>
            </div>
            )}

            <article
              className="prose prose-lg max-w-none text-gray-900 leading-loose font-sans [&>*]:text-justify"
              style={{
                wordBreak: "break-word",
                fontFamily:
                  '"SF Pro Text", "SF Pro Display", "SF Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, "Noto Sans", sans-serif',
                fontWeight: 400,
                fontStyle: "normal",
                fontSize: "17px",
                lineHeight: "30.1px",
                letterSpacing: "0",
                textAlign: "justify",
                textJustify: "inter-word",
                hyphens: "auto",
              }}
            >
              <div
                ref={articleContentRef}
                className="overflow-auto"
                dangerouslySetInnerHTML={{ 
                  __html: (() => {
                    console.log('Document type:', document.type);
                    console.log('Processed full content length:', processedFullContent?.length);
                    console.log('Processed content length:', processedContent?.length);
                    
                    // Pour les fiches méthodes, toujours afficher tout le contenu avec les titres
                    if (document.type === 'fiche-methode') {
                      // Si on a du contenu complet, l'utiliser
                      if (processedFullContent) {
                        let content = processedFullContent;
                        
                        console.log('Adding anchors to fiche-methode content');
                        
                        // Ajouter des ancres pour chaque section du sommaire
                        document.structure.sections.forEach((section: any) => {
                          const anchorId = section.id;
                          const titleRegex = new RegExp(`<strong>${section.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</strong>`, 'gi');
                          const replacement = `<strong id="${anchorId}">${section.title}</strong>`;
                          
                          console.log(`Looking for: ${section.title}`);
                          console.log(`Replacing with: ${replacement}`);
                          
                          const matches = content.match(titleRegex);
                          console.log(`Found ${matches ? matches.length : 0} matches for ${section.title}`);
                          
                          content = content.replace(titleRegex, replacement);
                        });
                        
                        console.log('Using full content for fiche-methode with anchors');
                        return content;
                      } else {
                        // Fallback : utiliser le contenu de l'article actuel
                        console.log('Using fallback content for fiche-methode');
                        return processedContent;
                      }
                    }
                    
                    // Pour les fiches de synthèse, afficher le contenu complet
                    if (document.type === 'fiche-synthese' && processedFullContent) {
                      return processedFullContent;
                    }
                    
                    // Pour les autres documents, afficher le contenu de l'article sélectionné
                    return processedContent;
                  })()
                }}
              />
              <style>
                {`
      .prose table {
        border-collapse: collapse;
        width: 100%;
        margin-bottom: 2em;
      }
      .prose th, .prose td {
        border: 1px solid #d1d5db;
        padding: 0.75em;
        text-align: left;
      }
      .prose th {
        background: #f3f4f6;
        font-weight: 600;
      }
      .prose tr:nth-child(even) td {
        background: #f9fafb;
      }
      .search-highlight {
        background-color: #770d28 !important;
        color: white !important;
        padding: 2px 4px;
        border-radius: 3px;
        font-weight: 500;
        display: inline;
        border-radius: 2px;
      }
      .search-highlight.current-match {
        background-color: #9a1a3a !important;
        box-shadow: 0 0 0 2px rgba(119, 13, 40, 0.5);
        font-weight: 600;
      }
      
      /* Styles pour les listes numérotées */
      .prose ol {
        list-style-type: decimal;
        margin-left: 1.5em;
        margin-bottom: 1em;
      }
      .prose ol li {
        margin-bottom: 0.5em;
        padding-left: 0.5em;
      }
      .prose ol li::marker {
        font-weight: 600;
        color: #374151;
      }
      
      /* Styles pour les listes à puces */
      .prose ul {
        list-style-type: disc;
        margin-left: 1.5em;
        margin-bottom: 1em;
      }
      .prose ul li {
        margin-bottom: 0.5em;
        padding-left: 0.5em;
      }
    `}
              </style>
            </article>
          </div>
        </div>

        {/* Sidebar Droite */}
        <div
          className="hidden lg:block w-80 border-l border-gray-200 h-[calc(100vh-200px)] overflow-y-auto"
          style={{ backgroundColor: "#FFFFFF" }}
        >
          <div
            className="p-4 sticky top-0 border-b border-gray-200"
            style={{ backgroundColor: "#FFFFFF" }}
          >
            {/* Recherche dans le document */}
            <div className="mb-6">
              <form onSubmit={handleDocumentSearchSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Rechercher dans le document"
                  value={documentSearch}
                  onChange={handleDocumentSearchChange}
                  className="pl-10 text-sm rounded-[6px] placeholder-[#89898A] border"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.06)",
                    borderColor: "#BCBCBC",
                  }}
                />
                {documentSearch && documentSearch.trim() !== '' && (
                  <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 bg-white px-2 py-1 rounded border">
                    <span className="text-xs font-medium text-gray-700">
                      {isSearching ? 'Recherche...' : (unifiedMatches.length > 0 ? `${currentUnifiedIndex + 1}/${unifiedMatches.length}` : '0 résultat')}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handlePrevResult}
                      disabled={unifiedMatches.length === 0 || isSearching}
                      className="p-1 h-6 w-6 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <ChevronUp className="w-4 h-4 text-black" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleNextResult}
                      disabled={unifiedMatches.length === 0 || isSearching}
                      className="p-1 h-6 w-6 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <ChevronDown className="w-4 h-4 text-black" />
                    </Button>
                  </div>
                )}
              </form>
            </div>

            {/* Résultats de recherche dans d'autres articles */}
            {searchResults.length > 0 && (
              <div className="mb-6">
                <div className="text-sm font-medium text-gray-700 mb-3">
                  Autres articles trouvés ({searchResults.length})
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <div
                      key={result.articleId}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => {
                        // Rediriger vers l'article trouvé
                        router.push(`/documents/${document.id}/${result.articleId}`);
                      }}
                    >
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {result.articleTitle}
                      </div>
                      <div className="text-xs text-gray-600">
                        {result.matches.length} correspondance{result.matches.length > 1 ? 's' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Outils d'annotation */}
            <div
              className="space-y-2 rounded-[5px] p-2"
              style={{ backgroundColor: "rgba(250, 245, 239, 0.5)" }}
            >
              <div
                className="text-xs font-medium mb-1"
                style={{ color: "rgba(0,0,0,0.7)" }}
              >
                Outils d'annotation
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start rounded-[5px]"
                style={{ backgroundColor: "rgba(238, 238, 238, 0)" }}
              >
                <Highlighter className="w-4 h-4 mr-2" />
                Surligner
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start rounded-[5px]"
                style={{ backgroundColor: "rgba(238, 238, 238, 0)" }}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Annoter
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start rounded-[5px]"
                style={{ backgroundColor: "rgba(238, 238, 238, 0)" }}
              >
                <Bookmark className="w-4 h-4 mr-2" />
                Marquer
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile: Boutons flottants - Toujours visibles */}
        {isMobile && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="fixed bottom-4 left-4 z-40 shadow-lg bg-white"
            >
              <Menu className="w-4 h-4 mr-2" />
              Navigation
            </Button>

            {/* Mobile Sidebar */}
            {sidebarOpen && (
              <div className="fixed inset-0 z-50">
                <div
                  className="absolute inset-0 bg-black/50"
                  onClick={() => setSidebarOpen(false)}
                />
                <div
                  className="absolute left-0 top-0 h-full w-80 flex flex-col"
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  <div
                    className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <h2 className="text-lg font-bold text-gray-900">
                      {getDocumentTypeLabel(document.type)}
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <ScrollArea className="flex-1" ref={sidebarMobileRef}>
                    <div className="p-2 space-y-1">
                                                                    {/* Gestion spéciale pour les fiches méthodes */}
                        {document.type === 'fiche-methode' ? (
                          // Pour les fiches méthodes, afficher toutes les sections comme des articles
                          document.structure.sections
                            .filter((section: any) => section.type === 'section-synthese')
                            .sort((a: any, b: any) => a.order - b.order)
                            .map((section: any) => renderSection(section))
                        ) : (
                        // Pour les autres documents, utiliser la logique normale
                        document.structure.sections
                          .filter((section: any) => {
                            // Afficher les sections de niveau 1 et 2, ou les titres et articles principaux
                            const isLevel1Or2 = section.level === 1 || section.level === 2;
                            const isTitreOrArticle = section.type === 'titre' || section.type === 'article';
                            
                            // Vérifier si cette section est un enfant d'une autre section
                            const isChildOfAnotherSection = document.structure.sections.some((parentSection: any) => 
                              parentSection.children && parentSection.children.includes(section.id)
                            );
                            
                            // Afficher si c'est un niveau 1/2 OU un titre/article, MAIS pas si c'est un enfant
                            return (isLevel1Or2 || isTitreOrArticle) && !isChildOfAnotherSection;
                          })
                          .map((section: any) => renderSection(section))
                      )}
                    </div>
                  </ScrollArea>

                  {/* Recherche mobile */}
                  <div className="p-4 border-t border-gray-200 flex-shrink-0">
                    <form
                      onSubmit={handleDocumentSearchSubmit}
                      className="relative mb-4"
                    >
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="Rechercher dans le document"
                        value={documentSearch}
                        onChange={handleDocumentSearchChange}
                        className="pl-10 text-sm rounded-[6px] placeholder-[#89898A] border"
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.06)",
                          borderColor: "#BCBCBC",
                        }}
                      />
                      {documentSearch && documentSearch.trim() !== '' && (
                        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 bg-white px-2 py-1 rounded border">
                          <span className="text-xs font-medium text-gray-700">
                            {isSearching ? 'Recherche...' : (unifiedMatches.length > 0 ? `${currentUnifiedIndex + 1}/${unifiedMatches.length}` : '0 résultat')}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handlePrevResult}
                            disabled={unifiedMatches.length === 0 || isSearching}
                            className="p-1 h-6 w-6 hover:bg-gray-100 disabled:opacity-50"
                          >
                            <ChevronUp className="w-4 h-4 text-black" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleNextResult}
                            disabled={unifiedMatches.length === 0 || isSearching}
                            className="p-1 h-6 w-6 hover:bg-gray-100 disabled:opacity-50"
                          >
                            <ChevronDown className="w-4 h-4 text-black" />
                          </Button>
                        </div>
                      )}
                    </form>

                    {/* Résultats de recherche dans d'autres articles - Mobile */}
                    {searchResults.length > 0 && (
                      <div className="mb-4">
                        <div className="text-sm font-medium text-gray-700 mb-3">
                          Autres articles trouvés ({searchResults.length})
                        </div>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {searchResults.map((result, index) => (
                            <div
                              key={result.articleId}
                              className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                              onClick={() => {
                                setSidebarOpen(false);
                                // Rediriger vers l'article trouvé
                                router.push(`/documents/${document.id}/${result.articleId}`);
                              }}
                            >
                              <div className="text-sm font-medium text-gray-900 mb-1">
                                {result.articleTitle}
                              </div>
                              <div className="text-xs text-gray-600">
                                {result.matches.length} correspondance{result.matches.length > 1 ? 's' : ''}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div
                      className="space-y-2 rounded-[5px] p-2"
                      style={{ backgroundColor: "rgba(250, 245, 239, 0.5)" }}
                    >
                      <div
                        className="text-xs font-medium mb-1"
                        style={{ color: "rgba(0,0,0,0.7)" }}
                      >
                        Outils d'annotation
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start rounded-[5px]"
                        style={{ backgroundColor: "rgba(238, 238, 238, 0)" }}
                      >
                        <Highlighter className="w-4 h-4 mr-2" />
                        Surligner
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start rounded-[5px]"
                        style={{ backgroundColor: "rgba(238, 238, 238, 0)" }}
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Annoter
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start rounded-[5px]"
                        style={{ backgroundColor: "rgba(238, 238, 238, 0)" }}
                      >
                        <Bookmark className="w-4 h-4 mr-2" />
                        Marquer
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}
